"""Async client for interacting with the Bnovo front desk API."""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
from typing import Any, Dict, Iterable, List, Optional

import httpx

from .config import Settings


@dataclass
class DailyStat:
    """Daily occupancy and revenue information."""

    day: date
    occupancy: int = 0
    base_amount: float = 0.0
    extra_amount: float = 0.0

    @property
    def total_amount(self) -> float:
        return self.base_amount + self.extra_amount

    def add(self, *, rooms: int = 1, base: float = 0.0, extra: float = 0.0) -> None:
        self.occupancy += rooms
        self.base_amount += base
        self.extra_amount += extra


class BnovoClient:
    """HTTP client that authenticates against Bnovo and loads booking data."""

    def __init__(self, settings: Settings) -> None:
        self._settings = settings
        self._client = httpx.AsyncClient(
            base_url=settings.bnovo_base_url,
            timeout=httpx.Timeout(30.0, read=60.0),
            headers={"User-Agent": "bnovo-telegram-report-bot/1.0"},
        )
        self._authenticated = False

    async def __aenter__(self) -> "BnovoClient":
        return self

    async def __aexit__(self, exc_type, exc, tb) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        await self._client.aclose()

    async def login(self) -> None:
        """Authenticate the HTTP client."""

        payload = {
            "username": self._settings.bnovo_username,
            "email": self._settings.bnovo_username,
            "login": self._settings.bnovo_username,
            "password": self._settings.bnovo_password,
        }

        response = await self._client.post(
            self._settings.bnovo_login_endpoint,
            json=payload,
            headers={"Content-Type": "application/json"},
        )
        response.raise_for_status()

        data = response.json()
        token: Optional[str] = (
            data.get("token")
            or data.get("access_token")
            or data.get("data", {}).get("token")
        )
        if token:
            self._client.headers["Authorization"] = f"Bearer {token}"

        self._authenticated = True

    async def fetch_daily_stats(
        self, start: date, end: date, *, hotel_id: Optional[str | int] = None
    ) -> List[DailyStat]:
        """Return aggregated stats for the requested period."""

        if not self._authenticated:
            await self.login()

        hotel = hotel_id or self._settings.bnovo_hotel_id
        if not hotel:
            raise ValueError("Не указан ID отеля для загрузки отчёта.")

        params = {
            "hotelId": hotel,
            "start": start.isoformat(),
            "end": end.isoformat(),
            "dateFrom": start.isoformat(),
            "dateTo": end.isoformat(),
        }

        response = await self._client.get(
            self._settings.bnovo_booking_endpoint,
            params=params,
        )
        response.raise_for_status()
        payload = response.json()

        if isinstance(payload, list):
            stats = self._aggregate_from_list(payload)
        else:
            stats = self._aggregate_from_dict(payload)

        return sorted(stats, key=lambda item: item.day)

    def _aggregate_from_list(self, payload: List[Any]) -> List[DailyStat]:
        stats_map: Dict[date, DailyStat] = {}
        for row in payload:
            if isinstance(row, dict) and "day" in row:
                day = self._parse_date(row["day"])
                if day is None:
                    continue
                stat = stats_map.setdefault(day, DailyStat(day))
                stat.add(
                    rooms=int(row.get("occupancy") or row.get("rooms") or 0),
                    base=float(row.get("amount") or row.get("revenue") or 0.0),
                    extra=float(row.get("extra") or row.get("extraAmount") or 0.0),
                )
                continue

            if isinstance(row, dict):
                self._aggregate_reservation(row, stats_map)

        return list(stats_map.values())

    def _aggregate_from_dict(self, payload: Dict[str, Any]) -> List[DailyStat]:
        stats_map: Dict[date, DailyStat] = {}

        if "days" in payload:
            for day_info in payload.get("days", []):
                if not isinstance(day_info, dict):
                    continue
                day = self._parse_date(day_info.get("date") or day_info.get("day"))
                if day is None:
                    continue
                stat = stats_map.setdefault(day, DailyStat(day))
                stat.add(
                    rooms=int(
                        day_info.get("occupancy")
                        or day_info.get("rooms")
                        or day_info.get("busy")
                        or 0
                    ),
                    base=float(
                        day_info.get("revenue")
                        or day_info.get("sum")
                        or day_info.get("amount")
                        or 0.0
                    ),
                    extra=float(
                        day_info.get("extra")
                        or day_info.get("extraAmount")
                        or day_info.get("add_place")
                        or 0.0
                    ),
                )

        reservations: Iterable[Any] = payload.get("reservations") or payload.get("orders") or []
        for reservation in reservations:
            self._aggregate_reservation(reservation, stats_map)

        return list(stats_map.values())

    def _aggregate_reservation(
        self, reservation: Dict[str, Any], stats_map: Dict[date, DailyStat]
    ) -> None:
        """Accumulate reservation data into the stats map."""

        daily_prices = reservation.get("daily_prices") or reservation.get("days")
        daily_prices = daily_prices or reservation.get("daily")
        if isinstance(daily_prices, list) and daily_prices:
            for day_item in daily_prices:
                if not isinstance(day_item, dict):
                    continue
                day = self._parse_date(day_item.get("date") or day_item.get("day"))
                if day is None:
                    continue
                stat = stats_map.setdefault(day, DailyStat(day))
                stat.add(
                    rooms=int(
                        day_item.get("rooms")
                        or day_item.get("occupancy")
                        or day_item.get("count")
                        or 1
                    ),
                    base=float(
                        day_item.get("base")
                        or day_item.get("price")
                        or day_item.get("amount")
                        or 0.0
                    ),
                    extra=float(
                        day_item.get("extra")
                        or day_item.get("extra_amount")
                        or day_item.get("additional")
                        or 0.0
                    ),
                )
            return

        check_in = self._parse_date(
            reservation.get("check_in")
            or reservation.get("start")
            or reservation.get("arrival")
        )
        check_out = self._parse_date(
            reservation.get("check_out")
            or reservation.get("end")
            or reservation.get("departure")
        )

        if check_in and check_out:
            nightly_count = (check_out - check_in).days or 1
            base_total = float(
                reservation.get("base")
                or reservation.get("total")
                or reservation.get("amount")
                or reservation.get("sum")
                or 0.0
            )
            extra_total = float(
                reservation.get("extra")
                or reservation.get("extra_amount")
                or reservation.get("additional")
                or reservation.get("extraBed")
                or 0.0
            )
            rooms = int(reservation.get("rooms") or reservation.get("room_count") or 1)

            base_per_day = base_total / nightly_count if nightly_count else base_total
            extra_per_day = extra_total / nightly_count if nightly_count else extra_total

            current_day = check_in
            while current_day < check_out:
                stat = stats_map.setdefault(current_day, DailyStat(current_day))
                stat.add(rooms=rooms, base=base_per_day, extra=extra_per_day)
                current_day = current_day + timedelta(days=1)

    def _parse_date(self, raw: Any) -> Optional[date]:
        if not raw:
            return None
        if isinstance(raw, date):
            return raw
        if isinstance(raw, datetime):
            return raw.date()
        if isinstance(raw, (int, float)):
            # assume unix timestamp in seconds
            return datetime.fromtimestamp(raw).date()
        if isinstance(raw, str):
            try:
                return datetime.fromisoformat(raw.replace("Z", "").split("+", 1)[0]).date()
            except ValueError:
                return None
        return None


__all__ = ["BnovoClient", "DailyStat"]
