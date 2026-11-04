import jwt from "jsonwebtoken";
import { AppError } from "../errors/AppError.js";
import { isTokenBlacklisted } from "../redis/tokenBlacklist.service.js";

const extractCustomerToken = (req) => {
  if (req.cookies?.customer_jwt && req.cookies.customer_jwt !== "logged_out") {
    return req.cookies.customer_jwt;
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  return null;
};

// Verify Storefront Customer JWT & Enforce Store Tenant Match
export const requireCustomerAuth = async (req, res, next) => {
  try {
    const token = extractCustomerToken(req);
    if (!token) {
      return next(new AppError("Customer login required.", 401));
    }

    const revoked = await isTokenBlacklisted(token);
    if (revoked) {
      return next(new AppError("Session expired. Please log in again.", 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "super_secret_fallback_key_2026",
    );

    if (
      decoded.tokenType !== "customer" ||
      decoded.merchantId !== req.merchantId
    ) {
      return next(
        new AppError("Unauthorized customer token for this store.", 403),
      );
    }

    req.customerId = decoded.id;
    req.rawCustomerToken = token;
    next();
  } catch (error) {
    return next(new AppError("Invalid or expired customer session.", 401));
  }
};