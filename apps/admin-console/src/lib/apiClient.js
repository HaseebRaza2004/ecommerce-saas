import { API } from "@/config/apiEndpoints";
import { ApiError, normalizeApiError } from "@/lib/apiError";

const PROXY_PREFIX = "/api/proxy";
const SKIP_REFRESH_PATHS = [
  API.AUTH.LOGIN,
  API.AUTH.REGISTER,
  API.AUTH.REFRESH,
  API.STAFF.LOGIN,
  API.OMNI_AUTH.MERCHANT,
];

let activeRefreshPromise = null;
let unauthorizedHandler = null;

export function setUnauthorizedHandler(fn) {
  unauthorizedHandler = typeof fn === "function" ? fn : null;
}

async function runSingleFlightRefresh() {
  if (!activeRefreshPromise) {
    activeRefreshPromise = fetch(`${PROXY_PREFIX}${API.AUTH.REFRESH}`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: JSON.stringify({}),
    })
      .then((res) => res.ok)
      .catch(() => false)
      .finally(() => {
        activeRefreshPromise = null;
      });
  }
  return activeRefreshPromise;
}

function buildUrl(endpoint, query) {
  const params = new URLSearchParams();
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") params.set(k, String(v));
    });
  }
  const qs = params.toString();
  return `${PROXY_PREFIX}${endpoint}${qs ? `?${qs}` : ""}`;
}

export async function apiRequest(
  endpoint,
  { method = "GET", body = null, query = null, domain = null, signal } = {},
) {
  const url = buildUrl(endpoint, query);
  const config = {
    method,
    credentials: "include",
    signal,
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      ...(body !== null ? { "Content-Type": "application/json" } : {}),
      ...(domain ? { "x-store-domain": domain } : {}),
    },
    ...(body !== null ? { body: JSON.stringify(body) } : {}),
  };

  let res;
  try {
    res = await fetch(url, config);
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    throw new ApiError(
      "Network error. Check your internet or local API server.",
      503,
    );
  }

  const canRefresh =
    res.status === 401 &&
    !SKIP_REFRESH_PATHS.some((p) => endpoint.startsWith(p));

  if (canRefresh) {
    const refreshed = await runSingleFlightRefresh();
    if (refreshed) {
      res = await fetch(url, config);
    } else if (unauthorizedHandler) {
      unauthorizedHandler();
    }
  }

  const payload = await res.json().catch(() => null);
  if (!res.ok || payload?.error) {
    throw normalizeApiError(payload?.status || res.status, payload);
  }
  return payload?.data ?? null;
}