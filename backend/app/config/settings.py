"""Configuración centralizada (entorno de la app y Supabase)."""

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

    app_host: str = Field(default="0.0.0.0", description="Host de uvicorn")
    app_port: int = Field(default=8000, ge=1, le=65535)
    cors_origins: str = Field(
        default="*",
        description="Orígenes CORS separados por coma, o * para todos",
    )

    supabase_url: str = Field(default="", description="URL del proyecto Supabase")
    supabase_anon_key: str = Field(default="", description="Clave anon")
    supabase_service_role_key: str = Field(
        default="",
        description="Clave service_role (solo backend)",
    )

    def cors_origins_list(self) -> list[str]:
        raw = self.cors_origins.strip()
        if raw == "*":
            return ["*"]
        return [o.strip() for o in raw.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
