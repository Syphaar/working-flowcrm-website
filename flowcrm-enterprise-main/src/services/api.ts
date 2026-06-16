import { storage } from "@/lib/storage";

const TOKEN_KEY = "auth:token";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getToken(): string | null {
  return storage.get<string | null>(TOKEN_KEY, null);
}

function setToken(token: string | null): void {
  if (token) storage.set(TOKEN_KEY, token);
  else storage.remove(TOKEN_KEY);
}

type RequestBody = Record<string, unknown> | FormData | undefined;

async function request<T>(
  path: string,
  options?: Omit<RequestInit, "body"> & {
    body?: RequestBody;
    params?: Record<string, string>;
  },
): Promise<T> {
  const token = getToken();
  const queryString = options?.params ? `?${new URLSearchParams(options.params).toString()}` : "";
  const url = `/api${path}${queryString}`;

  const headers: Record<string, string> = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  if (!(options?.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const body =
    options?.body instanceof FormData
      ? options.body
      : options?.body
        ? JSON.stringify(options.body)
        : undefined;

  const response = await fetch(url, {
    ...options,
    headers: { ...headers, ...(options?.headers as Record<string, string>) },
    body,
  });

  if (response.status === 401) {
    setToken(null);
    if (typeof window !== "undefined") {
      window.location.href = "/auth/login";
    }
    throw new ApiError("Session expired", 401);
  }

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new ApiError(body.error || `Request failed (${response.status})`, response.status);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function buildPath(base: string, id?: string, action?: string): string {
  let path = `/${base}`;
  if (id) path += `/${id}`;
  if (action) path += `/${action}`;
  return path;
}

interface EntityApi<T extends { id: string }> {
  getAll: () => Promise<T[]>;
  getById: (id: string) => Promise<T>;
  create: (data: Record<string, unknown>) => Promise<T>;
  update: (id: string, data: Record<string, unknown>) => Promise<T>;
  delete: (id: string) => Promise<{ ok: boolean }>;
  bulkDelete: (ids: string[]) => Promise<{ ok: boolean }>;
}

function createEntityService<T extends { id: string }>(basePath: string): EntityApi<T> {
  return {
    getAll: () => request<T[]>(buildPath(basePath)),
    getById: (id: string) => request<T>(buildPath(basePath, id)),
    create: (data: Record<string, unknown>) =>
      request<T>(buildPath(basePath), { method: "POST", body: data }),
    update: (id: string, data: Record<string, unknown>) =>
      request<T>(buildPath(basePath, id), { method: "PUT", body: data }),
    delete: (id: string) => request<{ ok: boolean }>(buildPath(basePath, id), { method: "DELETE" }),
    bulkDelete: (ids: string[]) =>
      request<{ ok: boolean }>(buildPath(basePath, undefined, "bulk-delete"), {
        method: "POST",
        body: { ids },
      }),
  };
}

export { ApiError, getToken, setToken, request, createEntityService };
export type { EntityApi };
