import jwt from "jsonwebtoken";
import crypto from "crypto";

/**
 * 🛡️ MICRO-FUNCTION 1: Generate Signed JWT & Attach HttpOnly Cookie
 */
export const sendTokenResponse = (merchant, statusCode, res, message) => {
  const token = jwt.sign(
    {
      id: merchant.merchant_id,
      role: merchant.role || "super_merchant",
      jti: crypto.randomUUID(), // Unique token ID to prevent replay collisions
    },
    process.env.JWT_SECRET || "super_secret_fallback_key_2026",
    { expiresIn: "15m" },
  );

  const cookieOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000),
    httpOnly: true, // Blocks XSS document.cookie theft
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict", // Blocks CSRF cross-origin requests
    path: "/",
  };

  return res
    .status(statusCode)
    .cookie("jwt", token, cookieOptions)
    .json({
      error: false,
      status: statusCode,
      message,
      data: {
        merchant_id: merchant.merchant_id,
        store_name: merchant.store_name,
        domain_url: merchant.domain_url,
        status: merchant.status,
      },
    });
};

/**
 * 🧹 MICRO-FUNCTION 2: Clear HttpOnly Cookie on Logout
 */
export const clearTokenCookie = (res) => {
  res.cookie("jwt", "logged_out", {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
  });
};
