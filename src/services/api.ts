// src/services/api.ts

const BASE_URL = process.env.API_BASE_URL || 'http://0.0.0.0:8001/api'; // ajusta si usas proxy o envs

type Query = Record<string, string | number | boolean | null | undefined>;

function buildURL(path: string, query?: Query) {
  const clean = path.replace(/^\/+/, '');
  const url = `${BASE_URL}/${clean}`;
  if (!query) return url;

  const qs = new URLSearchParams();
  Object.entries(query).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    qs.append(k, String(v));
  });
  const s = qs.toString();
  return s ? `${url}?${s}` : url;
}

export async function apiJson<T = unknown, B = unknown>(opts: {
  path: string; // ej: 'status' -> BASE_URL/status
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Query;
  body?: B;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}): Promise<T> {
  const { path, method = 'GET', query, body, headers = {}, signal } = opts;

  const url = buildURL(path, query);

  const init: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    signal,
  };

  if (method !== 'GET' && body !== undefined && body !== null) {
    init.body = JSON.stringify(body);
  }

  const res = await fetch(url, init);

  // Manejo básico de errores HTTP
  if (!res.ok) {
    // Intentar leer JSON de error
    let errorPayload: any = null;
    try {
      errorPayload = await res.json();
    } catch {
      // ignorar, no es JSON
    }
    const message =
      (errorPayload && (errorPayload.message || errorPayload.error)) ||
      res.statusText ||
      `HTTP ${res.status}`;

    const err = new Error(message) as Error & {
      status?: number;
      payload?: any;
    };
    err.status = res.status;
    err.payload = errorPayload;
    throw err;
  }

  return (await res.json()) as T;
}
