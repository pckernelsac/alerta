import type { DenunciaInput } from "../types/denuncia.ts";
import { getStoredToken } from "./auth.ts";

export type DenunciaApiResponse = {
  status: string;
  mensaje: string;
};

export type DenunciaFromApi = {
  id: string;
  tipo: string;
  descripcion: string;
  lat: number;
  lon: number;
  estado: string;
  timestamp: string;
  user_id: string | null;
  foto_url: string | null;
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
  return typeof data.status === "string" && typeof data.mensaje === "string";
}

export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_URL;
  const fromEnv = typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  return fromEnv || "/api";
}

function authHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) throw new DenunciaRequestError("Debes iniciar sesion.", 401, null);
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function formatFastApiDetail(detail: unknown): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        item && typeof item === "object" && "msg" in item
          ? String((item as { msg: string }).msg)
          : JSON.stringify(item),
      )
      .join(" · ");
  }
  if (detail && typeof detail === "object") return JSON.stringify(detail);
  return "No se pudo enviar la denuncia.";
}

/** Sube foto via backend y devuelve URL publica. */
export async function uploadFoto(file: File): Promise<string> {
  const base = getApiBase();
  const token = getStoredToken();
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${base}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new DenunciaRequestError(
      (body as { detail?: string }).detail ?? "Error al subir foto.",
      res.status,
      body,
    );
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}

export async function postDenuncia(
  payload: DenunciaInput,
): Promise<DenunciaApiResponse> {
  const base = getApiBase();
  let res: Response;
  try {
    res = await fetch(`${base}/denuncias`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch {
    throw new DenunciaRequestError(
      "No hay conexion con el servidor.",
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
    throw new DenunciaRequestError("Respuesta del servidor no valida.", res.status, data);
  }

  return data;
}

export async function fetchMisDenuncias(): Promise<DenunciaFromApi[]> {
  const base = getApiBase();
  const res = await fetch(`${base}/denuncias`, { headers: authHeaders() });
  if (!res.ok) {
    throw new DenunciaRequestError(`Error ${res.status}`, res.status, null);
  }
  return (await res.json()) as DenunciaFromApi[];
}

export function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Tu navegador no soporta geolocalizacion."));
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
      return "Permiso de ubicacion denegado. Activalo para enviar la alerta.";
    case err.POSITION_UNAVAILABLE:
      return "Ubicacion no disponible. Intentalo de nuevo.";
    case err.TIMEOUT:
      return "Tiempo agotado al obtener la ubicacion.";
    default:
      return "No se pudo obtener tu ubicacion.";
  }
}
