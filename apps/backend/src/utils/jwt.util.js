import jwt from "jsonwebtoken";

/**
 * 🛡️ ENTERPRISE JWT & COOKIE ENGINE
 * Responsibility: Securely generate JWT and attach it to an HttpOnly cookie.
 * Cyber Security Rule: Tokens must NEVER be accessible via frontend JavaScript (document.cookie).
 */
export const sendTokenResponse = (merchant, statusCode, res, message) => {
  // 1. Generate JWT Token
  // Payload mein sirf zaroori identifier (ID aur role) daalein, sensitive info nahi.
  const token = jwt.sign(
    { id: merchant.merchant_id, role: "admin" },
    process.env.JWT_SECRET || "super_secret_fallback_key_2026", // Production mein fallback use nahi hoga
    { expiresIn: "15m" }, // Security: Short-lived access token (15 mins) to prevent token hijacking
  );

  // 2. Cookie Options (Hacker-Proofing)
  const cookieOptions = {
    expires: new Date(Date.now() + 15 * 60 * 1000), // 15 Minutes
    httpOnly: true, // XSS Protection: Frontend JS is cookie ko read nahi kar sakti
    secure: process.env.NODE_ENV === "production", // Production mein sirf HTTPS par jayegi
    sameSite: "strict", // CSRF Protection: Kisi aur website se request aayi toh token nahi jayega
  };

  // 3. Send Response (Token cookie mein, data JSON mein)
  res
    .status(statusCode)
    .cookie("jwt", token, cookieOptions)
    .json({
      error: false,
      status: statusCode,
      message: message,
      data: {
        merchant_id: merchant.merchant_id,
        store_name: merchant.store_name,
        domain_url: merchant.domain_url,
      },
    });
};