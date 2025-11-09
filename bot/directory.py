"""Apartment-to-hotel directory utilities."""

from __future__ import annotations

import json
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Dict, Iterable, List, Mapping, MutableMapping, Optional

from .config import get_settings


@dataclass(frozen=True)
class Hotel:
    """Description of a Bnovo hotel."""

    id: int
    name: str


HOTELS: Mapping[str, Hotel] = {
    "СТАРТ": Hotel(id=29300, name="СТАРТ"),
    "Ладожский авенир": Hotel(id=49304, name="Ладожский авенир"),
    "ZOOM": Hotel(id=33271, name="ZOOM"),
    "Salut": Hotel(id=33273, name="Salut"),
    "Кировский авенир": Hotel(id=33274, name="Кировский авенир"),
    "Макаренко": Hotel(id=29182, name="Макаренко"),
    "Московский авенир": Hotel(id=39692, name="Московский авенир"),
    "Like,Panorama": Hotel(id=33857, name="Like,Panorama"),
    "Арцеуловская": Hotel(id=41645, name="Арцеуловская"),
    "Начало": Hotel(id=36440, name="Начало"),
    "Вингс": Hotel(id=38967, name="Вингс"),
    "In2it": Hotel(id=38968, name="In2it"),
    "Путилов авенир": Hotel(id=38924, name="Путилов авенир"),
    "Артлайн": Hotel(id=38925, name="Артлайн"),
    "Глоракс": Hotel(id=48490, name="Глоракс"),
    "Чирикова": Hotel(id=46953, name="Чирикова"),
    "Карповка": Hotel(id=49741, name="Карповка"),
}


def _normalize_key(value: str) -> str:
    return value.strip().lower()


HOTELS_BY_KEY: Mapping[str, Hotel] = {
    _normalize_key(name): hotel for name, hotel in HOTELS.items()
}
HOTELS_BY_ID: Mapping[str, Hotel] = {str(hotel.id): hotel for hotel in HOTELS.values()}


class ApartmentDirectory:
    """Look up hotels for a given apartment number."""

    def __init__(self, mapping: Mapping[str, Iterable[Hotel]]):
        normalized: MutableMapping[str, List[Hotel]] = {}
        for apartment, hotels in mapping.items():
            key = _normalize_key(apartment)
            normalized[key] = list(hotels)
        self._mapping: Dict[str, List[Hotel]] = dict(normalized)

    @classmethod
    def from_file(cls, path: Path) -> "ApartmentDirectory":
        if not path.exists():
            return cls({})

        with path.open("r", encoding="utf-8") as fp:
            data = json.load(fp)

        mapping: Dict[str, List[Hotel]] = {}
        if isinstance(data, Mapping):
            for apartment, hotels in data.items():
                resolved = [
                    hotel
                    for hotel in (
                        resolve_hotel_reference(item)
                        for item in _ensure_iterable(hotels)
                    )
                    if hotel is not None
                ]
                if resolved:
                    mapping[str(apartment)] = resolved

        return cls(mapping)

    def lookup(self, apartment: str) -> List[Hotel]:
        key = _normalize_key(apartment)
        return list(self._mapping.get(key, []))

    def hotel_by_id(self, hotel_id: str) -> Optional[Hotel]:
        return HOTELS_BY_ID.get(str(hotel_id))


def resolve_hotel_reference(reference: object) -> Optional[Hotel]:
    if isinstance(reference, Hotel):
        return reference

    if isinstance(reference, Mapping):
        hotel_id = reference.get("id")
        hotel_name = reference.get("name")
        if hotel_id is not None:
            resolved = HOTELS_BY_ID.get(str(hotel_id))
            if resolved:
                return resolved
        if isinstance(hotel_name, str):
            return HOTELS_BY_KEY.get(_normalize_key(hotel_name))
        return None

    if isinstance(reference, int):
        return HOTELS_BY_ID.get(str(reference))

    if isinstance(reference, str):
        ref = reference.strip()
        if not ref:
            return None
        if ref.isdigit():
            return HOTELS_BY_ID.get(ref)
        return HOTELS_BY_KEY.get(_normalize_key(ref))

    return None


def _ensure_iterable(value: object) -> Iterable[object]:
    if isinstance(value, (list, tuple, set)):
        return value
    return [value]


@lru_cache()
def get_apartment_directory() -> ApartmentDirectory:
    """Load the apartment directory defined in configuration."""

    settings = get_settings()
    return ApartmentDirectory.from_file(settings.apartment_mapping_file)


__all__ = [
    "ApartmentDirectory",
    "Hotel",
    "HOTELS",
    "get_apartment_directory",
]

