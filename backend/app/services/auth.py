"""Auth propio: JWT + bcrypt."""

from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import HTTPException, Request

from app.config import get_settings


class AuthUser:
    __slots__ = ("id", "email", "role")

    def __init__(self, id: str, email: str, role: str = "user"):
        self.id = id
        self.email = email
        self.role = role


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode(), hashed.encode())


def create_token(user_id: str, email: str, role: str) -> str:
    s = get_settings()
    payload = {
        "sub": user_id,
        "email": email,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=s.jwt_expire_days),
    }
    return jwt.encode(payload, s.jwt_secret, algorithm=s.jwt_algorithm)


def _decode_token(token: str) -> dict:
    s = get_settings()
    try:
        return jwt.decode(token, s.jwt_secret, algorithms=[s.jwt_algorithm])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expirado.")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token inválido.")


def _extract_token(request: Request) -> str:
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Token requerido.")
    return auth_header.split(" ", 1)[1]


def get_current_user(request: Request) -> AuthUser:
    token = _extract_token(request)
    payload = _decode_token(token)
    return AuthUser(
        id=payload["sub"],
        email=payload.get("email", ""),
        role=payload.get("role", "user"),
    )


def get_admin_user(request: Request) -> AuthUser:
    user = get_current_user(request)
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Acceso solo para administradores.")
    return user
