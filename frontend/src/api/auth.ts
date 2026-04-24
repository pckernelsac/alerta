import { getApiBase } from "./denuncia.ts";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export type AuthUserData = {
  id: string;
  email: string;
  role: string;
};

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUserData | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUserData;
  } catch {
    return null;
  }
}

function saveAuth(token: string, user: AuthUserData): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export async function apiRegister(
  email: string,
  password: string,
): Promise<{ user: AuthUserData; error: string | null }> {
  const base = getApiBase();
  const res = await fetch(`${base}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { user: null as unknown as AuthUserData, error: data.detail ?? "Error al registrar." };
  }
  saveAuth(data.token, data.user);
  return { user: data.user, error: null };
}

export async function apiLogin(
  email: string,
  password: string,
): Promise<{ user: AuthUserData; error: string | null }> {
  const base = getApiBase();
  const res = await fetch(`${base}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) {
    return { user: null as unknown as AuthUserData, error: data.detail ?? "Credenciales incorrectas." };
  }
  saveAuth(data.token, data.user);
  return { user: data.user, error: null };
}
