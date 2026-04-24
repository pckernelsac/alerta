from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from psycopg.rows import dict_row

from app.services.auth import create_token, hash_password, verify_password
from app.services.db import get_connection

router = APIRouter(prefix="/api/auth", tags=["auth"])

TABLE = "usuarios"


class RegisterBody(BaseModel):
    email: str = Field(..., min_length=5)
    password: str = Field(..., min_length=6)


class LoginBody(BaseModel):
    email: str
    password: str


class AuthResponse(BaseModel):
    token: str
    user: dict


@router.post("/register", response_model=AuthResponse)
def register(body: RegisterBody) -> AuthResponse:
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cur:
        cur.execute(f"SELECT id FROM {TABLE} WHERE email = %s LIMIT 1", (body.email,))
        existing = cur.fetchone()
        if existing:
            raise HTTPException(status_code=409, detail="El correo ya está registrado.")

        pw_hash = hash_password(body.password)
        cur.execute(
            f"""
            INSERT INTO {TABLE} (email, password_hash, role)
            VALUES (%s, %s, %s)
            RETURNING id, email, role
            """,
            (body.email, pw_hash, "user"),
        )
        user = cur.fetchone()
        conn.commit()

    if not user:
        raise HTTPException(status_code=500, detail="Error al crear usuario.")

    token = create_token(str(user["id"]), user["email"], user["role"])

    return AuthResponse(
        token=token,
        user={"id": str(user["id"]), "email": user["email"], "role": user["role"]},
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginBody) -> AuthResponse:
    with get_connection() as conn, conn.cursor(row_factory=dict_row) as cur:
        cur.execute(f"SELECT * FROM {TABLE} WHERE email = %s LIMIT 1", (body.email,))
        user = cur.fetchone()

    if not user:
        raise HTTPException(status_code=401, detail="Credenciales incorrectas.")

    if not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Credenciales incorrectas.")

    token = create_token(str(user["id"]), user["email"], user["role"])

    return AuthResponse(
        token=token,
        user={"id": str(user["id"]), "email": user["email"], "role": user["role"]},
    )
