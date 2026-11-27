import jwt from "jsonwebtoken";
import crypto from "crypto";
import { createDeviceSession } from "../core/security/sessionManager.service.js";
import { extractClientIp } from "./ip.util.js";

/**
 * 🛡️ Issue Access JWT (15m) + Rotatable Refresh Token (7d) for Owner, SaaS Admin, or Staff
 */
export const sendTokenResponse = async (
  account,
  statusCode,
  res,
  message,
  req = null,
) => {
  const ip = req ? extractClientIp(req) : "0.0.0.0";
  const userAgent = req?.headers["user-agent"] || "API-Client";
  const role = account.role || "super_merchant";
  const staffId = account.staff_id || null;
  const actorId = account.actor_id || staffId || account.merchant_id;

  const { sessionId, rawRefreshToken, authVer } = await createDeviceSession(
    actorId,
    account.merchant_id,
    staffId,
    role,
    ip,
    userAgent,
  );

  const token = jwt.sign(
    {
      id: account.merchant_id,
      actorId,
      staffId,
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
      merchant_id: account.merchant_id,
      staff_id: staffId,
      actor_id: actorId,
      role,
      name: account.name || account.store_name,
      email: account.email || null,
      store_name: account.store_name,
      domain_url: account.domain_url,
      status: account.status,
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