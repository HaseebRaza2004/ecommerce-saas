//  Enterprise HTTP Security Headers (CSP, HSTS, Anti-Sniffing, Clickjacking)
export const securityHeadersGuard = (req, res, next) => {
  // 1. Strict Content Security Policy (Blocks inline XSS scripts & unauthorized frames)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self';",
  );

  // 2. Force HTTPS in Production for 1 Year (HSTS)
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );

  // 3. Prevent MIME-Sniffing & Clickjacking iframes
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader(
    "Permissions-Policy",
    "camera=(self), microphone=(self), geolocation=()",
  );
  next();
};