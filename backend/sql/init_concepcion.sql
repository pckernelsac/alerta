-- Inicializacion de esquema para Alerta Concepcion (PostgreSQL)
-- Ejecutar con un usuario con permisos de DDL sobre la base "conce".

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS denuncias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    lat DOUBLE PRECISION NOT NULL CHECK (lat >= -90 AND lat <= 90),
    lon DOUBLE PRECISION NOT NULL CHECK (lon >= -180 AND lon <= 180),
    estado TEXT NOT NULL DEFAULT 'pendiente'
        CHECK (estado IN ('pendiente', 'en_revision', 'resuelta')),
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    user_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    foto_url TEXT
);

CREATE INDEX IF NOT EXISTS idx_denuncias_user_id ON denuncias (user_id);
CREATE INDEX IF NOT EXISTS idx_denuncias_timestamp ON denuncias ("timestamp" DESC);
CREATE INDEX IF NOT EXISTS idx_denuncias_estado ON denuncias (estado);
CREATE INDEX IF NOT EXISTS idx_denuncias_tipo ON denuncias (tipo);

COMMIT;

