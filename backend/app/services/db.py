"""Conexion simple a PostgreSQL via psycopg."""

from contextlib import contextmanager
from functools import lru_cache

from psycopg import Connection
from psycopg_pool import ConnectionPool

from app.config import get_settings


@lru_cache
def get_pool() -> ConnectionPool:
    settings = get_settings()
    if not settings.database_url:
        raise RuntimeError("DATABASE_URL debe estar configurada.")
    return ConnectionPool(conninfo=settings.database_url, min_size=1, max_size=10)


@contextmanager
def get_connection() -> Connection:
    pool = get_pool()
    with pool.connection() as conn:
        yield conn

