import jwt from "jsonwebtoken";
import { redisClient } from "../../config/redis.client.js";
import { AppError } from "../errors/AppError.js";
import { isTokenBlacklisted } from "../redis/tokenBlacklist.service.js";

export const extractToken = (req) => {
  if (req.cookies?.jwt && req.cookies.jwt !== "logged_out")
    return req.cookies.jwt;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer "))
    return authHeader.split(" ")[1];
  return null;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token)
      return next(new AppError("Authentication required. Please log in.", 401));

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_fallback_key_2026",
    );
    if (decoded.role === "customer" || decoded.tokenType === "customer") {
      return next(
        new AppError("Access denied. Merchant admin privileges required.", 403),
      );
    }

    // Parallel Check: Single Token Blacklist + Global 'Force Logout All Devices' Version
    const [revoked, activeAuthVer] = await Promise.all([
      isTokenBlacklisted(token),
      redisClient.get(`auth:ver:${decoded.id}`),
    ]);

    if (revoked) return next(new AppError("Session has been logged out.", 401));
    if (
      activeAuthVer &&
      decoded.ver &&
      String(activeAuthVer) !== String(decoded.ver)
    ) {
      return next(
        new AppError(
          "Session invalidated by Force-Logout-All security action.",
          401,
        ),
      );
    }

    req.merchantId = decoded.id;
    req.userRole = decoded.role || "super_merchant";
    req.sessionId = decoded.sid || null;
    req.rawToken = token;
    next();
  } catch {
    return next(
      new AppError(
        "Invalid or expired session token. Please log in again.",
        401,
      ),
    );
  }
};

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