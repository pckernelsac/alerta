import { getStoredToken } from "./auth.ts";
import { getApiBase } from "./denuncia.ts";

export type DenunciaAdmin = {
  id: string;
  tipo: string;
  descripcion: string;
  lat: number;
  lon: number;
  estado: string;
  timestamp: string;
  user_id: string | null;
  foto_url: string | null;
  user_email: string | null;
};

export type AdminStats = {
  total: number;
  pendientes: number;
  en_revision: number;
  resueltas: number;
};

function adminHeaders(): Record<string, string> {
  const token = getStoredToken();
  if (!token) throw new Error("Sesion expirada.");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

export async function fetchDenunciasAdmin(
  filtros?: { estado?: string; tipo?: string },
): Promise<DenunciaAdmin[]> {
  const base = getApiBase();
  const params = new URLSearchParams();
  if (filtros?.estado) params.set("estado", filtros.estado);
  if (filtros?.tipo) params.set("tipo", filtros.tipo);
  const qs = params.toString();

  const res = await fetch(`${base}/admin/denuncias${qs ? `?${qs}` : ""}`, {
    headers: adminHeaders(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `Error ${res.status}`);
  }
  return (await res.json()) as DenunciaAdmin[];
}

export async function updateEstado(denunciaId: string, estado: string): Promise<void> {
  const base = getApiBase();
  const res = await fetch(`${base}/admin/denuncias/${denunciaId}`, {
    method: "PATCH",
    headers: adminHeaders(),
    body: JSON.stringify({ estado }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `Error ${res.status}`);
  }
}

export async function fetchAdminStats(): Promise<AdminStats> {
  const base = getApiBase();
  const res = await fetch(`${base}/admin/stats`, { headers: adminHeaders() });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { detail?: string }).detail ?? `Error ${res.status}`);
  }
  return (await res.json()) as AdminStats;
}

export async function checkIsAdmin(): Promise<boolean> {
  const base = getApiBase();
  try {
    const res = await fetch(`${base}/admin/me`, { headers: adminHeaders() });
    return res.ok;
  } catch {
    return false;
  }
}
