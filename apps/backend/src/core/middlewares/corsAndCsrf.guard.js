import { AppError } from "../errors/AppError.js";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

// Dynamic CORS & Anti-CSRF Shield (CORS Configuration & CSRF Protection)
export const corsAndCsrfGuard = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedEnvOrigins = (
    process.env.ALLOWED_ORIGINS || "http://localhost:3000,http://localhost:3001"
  ).split(",");

  if (origin) {
    const isLocalDev =
      process.env.NODE_ENV !== "production" &&
      origin.startsWith("http://localhost:");
    const isExplicitlyAllowed = allowedEnvOrigins.includes(origin);

    // Allow registered custom storefront domains when x-store-domain matches Origin hostname
    let isMatchingStoreDomain = false;
    try {
      const originHost = new URL(origin).hostname.toLowerCase();
      const requestedDomain = (
        req.headers["x-store-domain"] ||
        req.query.domain ||
        ""
      ).toLowerCase();
      isMatchingStoreDomain = Boolean(
        requestedDomain && originHost === requestedDomain,
      );
    } catch {
      isMatchingStoreDomain = false;
    }

    if (!isLocalDev && !isExplicitlyAllowed && !isMatchingStoreDomain) {
      return next(
        new AppError(
          `CORS Policy Blocked: Origin '${origin}' is not authorized.`,
          403,
        ),
      );
    }

    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, X-Requested-With, X-CSRF-Token, X-Store-Domain, X-Merchant-Id",
    );
  }

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // CSRF Defense: For browser cookie requests, enforce JSON Content-Type or X-Requested-With / X-CSRF-Token
  if (STATE_CHANGING_METHODS.has(req.method) && origin) {
    const contentType = (req.headers["content-type"] || "").toLowerCase();
    const hasCustomHeader = Boolean(
      req.headers["x-requested-with"] || req.headers["x-csrf-token"],
    );
    if (!contentType.includes("application/json") && !hasCustomHeader) {
      return next(
        new AppError(
          "CSRF Shield: Missing required security headers on state-changing request.",
          403,
        ),
      );
    }
  }

  next();
};