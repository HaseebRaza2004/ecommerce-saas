export function resolveBackendBaseUrl() {
  const envMode = (process.env.ACTIVE_API_ENV || "dev").toLowerCase();
  const baseUrl =
    envMode === "prod" ? process.env.API_PROD_URL : process.env.API_DEV_URL;
  return (baseUrl || "http://localhost:5000").replace(/\/+$/, "");
}

export function isAllowedProxyPath(segments) {
  if (!Array.isArray(segments) || segments.length === 0) return false;
  if (segments.some((part) => part === ".." || part.includes("\\"))) {
    return false;
  }
  const joined = `/${segments.join("/")}`;
  return joined === "/api/health" || joined.startsWith("/api/v1/");
}

export function adaptCookieForLocalHttp(rawCookie, isLocalHttp) {
  if (!isLocalHttp) return rawCookie;
  return rawCookie
    .replace(/;\s*Secure/gi, "")
    .replace(/;\s*SameSite=None/gi, "; SameSite=Lax");
}