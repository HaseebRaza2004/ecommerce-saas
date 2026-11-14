import { sanitizePayload } from "@/lib/validators";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://ecommerce-saas-backend-y031.onrender.com";

let refreshPromise = null;

const performSilentRefresh = async () => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/v1/auth/admin/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({}),
    }).finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
};

export const apiRequest = async (
  endpoint,
  { method = "GET", body = null, domain = null, headers = {} } = {},
) => {
  const safeBody = body ? sanitizePayload(body) : null;
  const config = {
    method,
    credentials: "include",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      ...(safeBody ? { "Content-Type": "application/json" } : {}),
      ...(domain
        ? { "x-store-domain": String(domain).trim().toLowerCase() }
        : {}),
      ...headers,
    },
    ...(safeBody ? { body: JSON.stringify(safeBody) } : {}),
  };

  let res = await fetch(`${API_BASE}${endpoint}`, config);

  const isAuthEndpoint =
    endpoint.includes("/auth/admin/login") ||
    endpoint.includes("/auth/admin/register") ||
    endpoint.includes("/auth/admin/refresh") ||
    endpoint.includes("/staff/login");

  if (res.status === 401 && !isAuthEndpoint) {
    const refreshRes = await performSilentRefresh().catch(() => null);
    if (refreshRes && refreshRes.ok) {
      res = await fetch(`${API_BASE}${endpoint}`, config);
    }
  }

  const payload = await res.json().catch(() => ({
    error: true,
    status: res.status,
    message: "Network or JSON parsing error occurred.",
    data: null,
  }));

  if (!res.ok || payload.error) {
    const err = new Error(payload.message || "Request failed");
    err.status = payload.status || res.status;
    throw err;
  }

  return payload.data;
};