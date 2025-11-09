"""Configuration helpers for the Bnovo Telegram bot."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path
from typing import Optional

from pydantic import BaseSettings, Field, validator


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    telegram_token: str = Field(..., alias="TELEGRAM_TOKEN")
    bnovo_base_url: str = Field(..., alias="BNOVO_BASE_URL")
    bnovo_username: str = Field(..., alias="BNOVO_USERNAME")
    bnovo_password: str = Field(..., alias="BNOVO_PASSWORD")
    bnovo_hotel_id: Optional[str] = Field(None, alias="BNOVO_HOTEL_ID")
    report_template: Optional[Path] = Field(None, alias="REPORT_TEMPLATE")
    report_output_dir: Path = Field(Path("reports"), alias="REPORT_OUTPUT_DIR")
    apartment_mapping_file: Path = Field(
        Path("bot/data/apartments.json"), alias="APARTMENT_MAPPING_FILE"
    )
    bnovo_login_endpoint: str = Field("/api/v1/auth/sign-in", alias="BNOVO_LOGIN_ENDPOINT")
    bnovo_booking_endpoint: str = Field(
        "/api/v1/frontend/booking-grid", alias="BNOVO_BOOKING_ENDPOINT"
    )

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False

    @validator("bnovo_base_url", pre=True)
    @classmethod
    def _normalize_base_url(cls, value: str) -> str:
        if value.endswith("/"):
            return value[:-1]
        return value


@lru_cache()
def get_settings() -> Settings:
    """Load application settings."""

    settings = Settings()  # type: ignore[call-arg]
    settings.report_output_dir.mkdir(parents=True, exist_ok=True)
    return settings


__all__ = ["Settings", "get_settings"]
