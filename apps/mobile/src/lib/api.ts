import Constants from 'expo-constants';

const API_BASE: string = (Constants.expoConfig?.extra?.apiUrl as string) ?? 'http://localhost:3000';

let _accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  _accessToken = token;
}

export function getAccessToken(): string | null {
  return _accessToken;
}

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

async function refreshTokens(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) return null;
    const data = await res.json();
    _accessToken = data.accessToken ?? null;
    return _accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {}
): Promise<T> {
  const { skipAuth = false, ...fetchOptions } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (!skipAuth && _accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...fetchOptions,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && !skipAuth) {
    const newToken = await refreshTokens();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      const retryRes = await fetch(`${API_BASE}${path}`, {
        ...fetchOptions,
        headers,
        credentials: 'include',
      });
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({}));
        throw new Error((err as any).error ?? `HTTP ${retryRes.status}`);
      }
      return retryRes.json() as Promise<T>;
    }
    throw new Error('UNAUTHORIZED');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
