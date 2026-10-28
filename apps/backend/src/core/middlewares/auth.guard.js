import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { isTokenBlacklisted } from "../redis/cache.service.js";

/**
 * 🔎 MICRO-FUNCTION 1: Extract Token from Cookie (Web) or Bearer Header (Mobile/POS)
 */
export const extractToken = (req) => {
  if (req.cookies && req.cookies.jwt && req.cookies.jwt !== "logged_out") {
    return req.cookies.jwt;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

/**
 * 🛡️ MICRO-FUNCTION 2: Verify JWT, Check Redis Revocation & Inject req.merchantId
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(new AppError("Authentication required. Please log in.", 401));
    }

    // Security: Reject token if user already logged out
    const revoked = await isTokenBlacklisted(token);
    if (revoked) {
      return next(
        new AppError("Session has been logged out. Please log in again.", 401),
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_fallback_key_2026",
    );

    req.merchantId = decoded.id;
    req.userRole = decoded.role || "super_merchant";
    req.rawToken = token;

    next();
  } catch (error) {
    return next(
      new AppError(
        "Invalid or expired session token. Please log in again.",
        401,
      ),
    );
  }
};

/**
 * 👮 MICRO-FUNCTION 3: Role-Based Access Control (RBAC)
 */
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return next(
        new AppError("Access denied. Insufficient role permissions.", 403),
      );
    }
    next();
  };
};
