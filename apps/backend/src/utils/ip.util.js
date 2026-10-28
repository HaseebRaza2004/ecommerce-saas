// Extract True Client IP (Cloudflare & Reverse-Proxy Safe — Blueprint Q33)
export const extractClientIp = (req) => {
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp) return cfIp;

  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();

  return req.socket?.remoteAddress || "0.0.0.0";
};