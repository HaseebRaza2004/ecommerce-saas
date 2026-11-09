import jwt from "jsonwebtoken";
import crypto from "crypto";
import { redisClient } from "../../../config/redis.client.js";
import { sendResponse } from "../../../utils/responseHandler.js";
import { clearTokenCookie } from "../../../utils/jwt.util.js";
import { extractClientIp } from "../../../utils/ip.util.js";
import {
  rotateRefreshTokenService,
  revokeAllUserSessions,
} from "../../../core/security/sessionManager.service.js";

// Rotate Refresh Token & Issue Fresh 15m Access JWT
export const refreshAdminSession = async (req, res, next) => {
  try {
    const rawRefresh = req.cookies?.refresh_jwt || req.body?.refreshToken;
    const ip = extractClientIp(req);
    const ua = req.headers["user-agent"] || "API-Client";

    const { userId, role, sessionId, newRefreshToken, authVer } =
      await rotateRefreshTokenService(rawRefresh, ip, ua);

    const newAccessJwt = jwt.sign(
      {
        id: userId,
        role,
        sid: sessionId,
        ver: String(authVer),
        jti: crypto.randomUUID(),
      },
      process.env.JWT_SECRET || "super_secret_fallback_key_2026",
      { expiresIn: "15m" },
    );

    const isProd = process.env.NODE_ENV === "production";
    const baseOpts = {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? "none" : "lax",
      path: "/",
    };

    res.cookie("jwt", newAccessJwt, {
      ...baseOpts,
      expires: new Date(Date.now() + 15 * 60 * 1000),
    });
    res.cookie("refresh_jwt", newRefreshToken, {
      ...baseOpts,
      expires: new Date(Date.now() + 7 * 86400000),
    });

    return sendResponse(res, 200, "Session token rotated securely.", {
      session_id: sessionId,
    });
  } catch (error) {
    next(error);
  }
};

// List All Active Logged-In Devices
export const getActiveSessions = async (req, res, next) => {
  try {
    const sids = await redisClient.smembers(`sess:list:${req.merchantId}`);
    if (!sids || sids.length === 0) {
      return sendResponse(res, 200, "Active device sessions fetched.", []);
    }

    const pipeline = redisClient.pipeline();
    for (const sid of sids) {
      pipeline.get(`sess:${req.merchantId}:${sid}`);
    }
    const results = await pipeline.exec();

    const sessions = [];
    for (const [err, raw] of results) {
      if (!err && raw) {
        const parsed = JSON.parse(raw);
        delete parsed.refreshHash;
        parsed.is_current_device = parsed.sessionId === req.sessionId;
        sessions.push(parsed);
      }
    }
    return sendResponse(res, 200, "Active device sessions fetched.", sessions);
  } catch (error) {
    next(error);
  }
};

// Force Logout All Devices 
export const forceLogoutAllDevices = async (req, res, next) => {
  try {
    const result = await revokeAllUserSessions(req.merchantId);
    clearTokenCookie(res);
    return sendResponse(
      res,
      200,
      "All devices forcefully logged out and tokens revoked.",
      result,
    );
  } catch (error) {
    next(error);
  }
};