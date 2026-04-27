/**
 * API client — every call to API_BASE_URL includes Authorization: Bearer <token>
 * when a token is present in localStorage. Designed for predictable E2E behavior.
 */
export const API_BASE_URL = "http://localhost:8080";
export const TOKEN_KEY = "shopcart_token";
export const USER_KEY = "shopcart_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

export async function apiFetch<T = unknown>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const res = await fetch(url, { ...options, headers });

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* ignore */
  }

  if (!res.ok) {
    const msg =
      (body as { message?: string })?.message || `Request failed with status ${res.status}`;
    throw new ApiError(res.status, msg, body);
  }

  return body as T;
}
