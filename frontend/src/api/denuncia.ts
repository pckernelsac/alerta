import type { DenunciaInput } from "../types/denuncia.ts";
import { supabase } from "../lib/supabase.ts";

export type DenunciaApiResponse = {
  status: string;
  mensaje: string;
};

export class DenunciaRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown,
  ) {
    super(message);
    this.name = "DenunciaRequestError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isDenunciaApiResponse(data: unknown): data is DenunciaApiResponse {
  if (!isRecord(data)) return false;
  return (
    typeof data.status === "string" &&
    typeof data.mensaje === "string"
  );
}

/**
 * URL base del API (sin barra final).
 * - Dev: proxy Vite `/api` → backend local.
 * - Producción (Vercel): mismo origen `/api`.
 * - Override: `VITE_API_URL` si está definida.
 */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL;
  const fromEnv =
    typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  return fromEnv || "/api";
}

function formatFastApiDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const parts = detail.map((item) => {
      if (item && typeof item === "object" && "msg" in item) {
        return String((item as { msg: string }).msg);
      }
      return JSON.stringify(item);
    });
    return parts.join(" · ");
  }
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return "No se pudo enviar la denuncia.";
}

/** Sube una foto a Supabase Storage y devuelve la URL pública. */
export async function uploadFoto(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("denuncias-fotos")
    .upload(path, file, { contentType: file.type });

  if (error) {
    throw new DenunciaRequestError(
      `Error al subir foto: ${error.message}`,
      0,
      error,
    );
  }

  const { data } = supabase.storage
    .from("denuncias-fotos")
    .getPublicUrl(path);

  return data.publicUrl;
}

/** Obtiene el access token del usuario actual. */
async function getAccessToken(): Promise<string> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new DenunciaRequestError("Debes iniciar sesión.", 401, null);
  }
  return token;
}

export async function postDenuncia(
  payload: DenunciaInput,
): Promise<DenunciaApiResponse> {
  const base = getApiBase();
  const token = await getAccessToken();

  let res: Response;
  try {
    res = await fetch(`${base}/denuncias`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new DenunciaRequestError(
      "No hay conexión con el servidor. Comprueba la URL del API y la red.",
      0,
      null,
    );
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text) as unknown;
    } catch {
      data = { raw: text };
    }
  }

  if (!res.ok) {
    let message = `Error del servidor (${res.status})`;
    if (isRecord(data) && "detail" in data) {
      message = formatFastApiDetail(data.detail);
    }
    throw new DenunciaRequestError(message, res.status, data);
  }

  if (!isDenunciaApiResponse(data)) {
    throw new DenunciaRequestError(
      "Respuesta del servidor no válida.",
      res.status,
      data,
    );
  }

  return data;
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Tu navegador no soporta geolocalización."));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15_000,
      maximumAge: 0,
    });
  });
}

export function geolocationErrorMessage(err: GeolocationPositionError): string {
  switch (err.code) {
    case err.PERMISSION_DENIED:
      return "Permiso de ubicación denegado. Actívalo para enviar la alerta.";
    case err.POSITION_UNAVAILABLE:
      return "Ubicación no disponible. Inténtalo de nuevo.";
    case err.TIMEOUT:
      return "Tiempo agotado al obtener la ubicación.";
    default:
      return "No se pudo obtener tu ubicación.";
  }
}
