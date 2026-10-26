import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";

// MICRO-FUNCTION 1: Extract Token from Cookie (Web) or Header (Mobile App / POS)
 
const extractToken = (req) => {
  if (req.cookies && req.cookies.jwt) {
    return req.cookies.jwt;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

//  MICRO-FUNCTION 2: Verify JWT & Inject Tenant Context (req.merchantId)

export const requireAuth = (req, res, next) => {
  try {
    const token = extractToken(req);

    if (!token) {
      return next(new AppError("Authentication required. Please log in.", 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_fallback_key_2026",
    );

    // Lock tenant isolation context onto the request object
    req.merchantId = decoded.id;
    req.userRole = decoded.role || "super_merchant";

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

// MICRO-FUNCTION 3: Role-Based Access Control (RBAC Guard)
  
export const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.userRole)) {
      return next(
        new AppError(
          "Access denied. You do not have permission to perform this action.",
          403,
        ),
      );
    }
    next();
  };
};