const SERVER_URL = process.env.NEXT_PUBLIC_ADMIN_SERVER_URL || 'http://localhost:4100';
const PASSWORD_KEY = 'ambi-admin-password';
export const SIGNED_OUT_EVENT = 'ambi-admin-signed-out';

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

// The admin password lives in this browser's localStorage so a refresh
// doesn't sign you out. Only one admin uses this app, on their own machine.
export function getPassword(): string | null {
  try {
    return localStorage.getItem(PASSWORD_KEY);
  } catch {
    return null;
  }
}

export function setPassword(password: string | null) {
  try {
    if (password) localStorage.setItem(PASSWORD_KEY, password);
    else localStorage.removeItem(PASSWORD_KEY);
  } catch {
    // Storage blocked: the session lasts until the tab closes.
  }
}

export function signOut() {
  setPassword(null);
  window.dispatchEvent(new Event(SIGNED_OUT_EVENT));
}

/**
 * Calls ambi-admin-server with the admin password as a bearer token. A 401
 * signs out so the gate asks for the password again.
 */
export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; password?: string } = {},
): Promise<T> {
  const res = await fetch(`${SERVER_URL}${path}`, {
    method: options.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${options.password ?? getPassword() ?? ''}`,
      ...(options.body !== undefined && { 'Content-Type': 'application/json' }),
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  if (res.status === 401 && !options.password) signOut();
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(data?.error ?? `Request failed (${res.status})`, res.status);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}
