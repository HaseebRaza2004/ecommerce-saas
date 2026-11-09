import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createDeviceSession } from "../core/security/sessionManager.service.js";
import { extractClientIp } from "./ip.util.js";

// Issue Short-Lived Access JWT (15m) + Rotatable Refresh Token (7d) + Device Session
export const sendTokenResponse = async (
  merchant,
  statusCode,
  res,
  message,
  req = null,
) => {
  const ip = req ? extractClientIp(req) : "0.0.0.0";
  const userAgent = req?.headers["user-agent"] || "API-Client";
  const role = merchant.role || "super_merchant";

  const { sessionId, rawRefreshToken, authVer } = await createDeviceSession(
    merchant.merchant_id,
    role,
    ip,
    userAgent,
  );

  const token = jwt.sign(
    {
      id: merchant.merchant_id,
      role,
      sid: sessionId,
      ver: String(authVer),
      jti: crypto.randomUUID(),
    },
    process.env.JWT_SECRET || "super_secret_fallback_key_2026",
    { expiresIn: "15m" },
  );

  const isProd = process.env.NODE_ENV === "production";
  const baseCookieOpts = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };

  res.cookie("jwt", token, {
    ...baseCookieOpts,
    expires: new Date(Date.now() + 15 * 60 * 1000),
  });

  res.cookie("refresh_jwt", rawRefreshToken, {
    ...baseCookieOpts,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  return res.status(statusCode).json({
    error: false,
    status: statusCode,
    message,
    data: {
      merchant_id: merchant.merchant_id,
      staff_id: merchant.staff_id || null,
      role,
      store_name: merchant.store_name,
      domain_url: merchant.domain_url,
      status: merchant.status,
      session_id: sessionId,
    },
  });
};

export const clearTokenCookie = (res) => {
  const isProd = process.env.NODE_ENV === "production";
  const opts = {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  };
  res.cookie("jwt", "logged_out", opts);
  res.cookie("refresh_jwt", "logged_out", opts);
};