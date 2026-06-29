const API_BASE = "/api/v1";

const ACCESS_KEY = "mds_access_token";
const REFRESH_KEY = "mds_refresh_token";

export const tokenStore = {
  get access() {
    return localStorage.getItem(ACCESS_KEY);
  },
  get refresh() {
    return localStorage.getItem(REFRESH_KEY);
  },
  set(access: string, refresh: string) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(REFRESH_KEY, refresh);
  },
  setAccess(access: string) {
    localStorage.setItem(ACCESS_KEY, access);
  },
  clear() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (!tokenStore.refresh) return false;
  if (!refreshing) {
    refreshing = fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: tokenStore.refresh }),
    })
      .then(async (res) => {
        if (!res.ok) return false;
        const data = await res.json();
        tokenStore.setAccess(data.access_token);
        return true;
      })
      .catch(() => false)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  isForm?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
  retry = true,
): Promise<T> {
  const { body, isForm, headers, ...rest } = options;
  const finalHeaders = new Headers(headers);

  if (tokenStore.access) {
    finalHeaders.set("Authorization", `Bearer ${tokenStore.access}`);
  }

  let payload: BodyInit | undefined;
  if (isForm) {
    payload = body as BodyInit;
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    payload = JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...rest,
    headers: finalHeaders,
    body: payload,
  });

  if (res.status === 401 && retry && (await tryRefresh())) {
    return apiFetch<T>(path, options, false);
  }

  if (!res.ok) {
    let detail = res.statusText;
    try {
      const data = await res.json();
      detail = data.detail ?? detail;
    } catch {
      /* ignore */
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
