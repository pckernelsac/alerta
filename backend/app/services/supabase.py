"""Singleton del cliente Supabase (service_role para el backend)."""

from functools import lru_cache

from supabase import Client, create_client

from app.config import get_settings


@lru_cache
def get_supabase() -> Client:
    s = get_settings()
    if not s.supabase_url or not s.supabase_service_role_key:
        raise RuntimeError(
            "SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY deben estar configuradas."
        )
    return create_client(s.supabase_url, s.supabase_service_role_key)
