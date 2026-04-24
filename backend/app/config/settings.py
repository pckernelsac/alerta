"""Configuración centralizada."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    app_host: str = Field(default="0.0.0.0")
    app_port: int = Field(default=8000, ge=1, le=65535)
    cors_origins: str = Field(default="*")

    database_url: str = Field(
        default="postgres://postgres:jce29xl4hnfe56ne5jzn@conce_bd-alerta:5432/conce?sslmode=disable"
    )

    jwt_secret: str = Field(default="alerta-concepcion-secret-change-me")
    jwt_algorithm: str = Field(default="HS256")
    jwt_expire_days: int = Field(default=7)

    def cors_origins_list(self) -> list[str]:
        raw = self.cors_origins.strip()
        if raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
