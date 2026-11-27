import crypto from "crypto";
import { redisClient } from "../../config/redis.client.js";
import { AppError } from "../errors/AppError.js";
import { logSecurityEvent } from "../../utils/logger.js";

const hashToken = (t) =>
  crypto.createHash("sha256").update(String(t)).digest("hex");

/**
 * 📱 1. Create Per-Actor Device Session (Isolates Staff Sessions from Merchant Owner!)
 */
export const createDeviceSession = async (
  actorId,
  merchantId,
  staffId,
  role,
  ip,
  userAgent,
) => {
  const sessionId = crypto.randomUUID();
  const rawRefreshToken = `${sessionId}.${crypto.randomBytes(32).toString("hex")}`;
  const refreshHash = hashToken(rawRefreshToken);

  const authVer = (await redisClient.get(`auth:ver:${actorId}`)) || "1";
  const sessionData = {
    sessionId,
    actorId,
    merchantId,
    staffId: staffId || null,
    role,
    refreshHash,
    ip,
    device: String(userAgent || "Unknown Device").slice(0, 120),
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };

  await Promise.all([
    redisClient.set(
      `sess:${actorId}:${sessionId}`,
      JSON.stringify(sessionData),
      "EX",
      604800,
    ),
    redisClient.set(
      `sess:lookup:${sessionId}`,
      JSON.stringify({ actorId }),
      "EX",
      604800,
    ),
    redisClient.sadd(`sess:list:${actorId}`, sessionId),
  ]);

  return { sessionId, rawRefreshToken, authVer };
};

/**
 * 🔄 2. Refresh Token Rotation + Theft Reuse Detection
 */
export const rotateRefreshTokenService = async (rawRefreshToken, ip) => {
  if (!rawRefreshToken || !rawRefreshToken.includes(".")) {
    throw new AppError("Refresh token is missing or invalid.", 401);
  }
  const [sessionId] = rawRefreshToken.split(".");
  const incomingHash = hashToken(rawRefreshToken);

  const rawLookup = await redisClient.get(`sess:lookup:${sessionId}`);
  if (!rawLookup)
    throw new AppError("Session expired. Please log in again.", 401);

  const lookup = JSON.parse(rawLookup);
  const actorId = lookup.actorId || lookup.userId;
  const fullRaw = await redisClient.get(`sess:${actorId}:${sessionId}`);
  if (!fullRaw) throw new AppError("Session has been terminated.", 401);

  const session = JSON.parse(fullRaw);

  if (session.refreshHash !== incomingHash) {
    await revokeAllUserSessions(actorId);
    await logSecurityEvent("REFRESH_TOKEN_THEFT_DETECTED_ALL_SESSIONS_NUKED", {
      actorId,
      merchantId: session.merchantId || actorId,
      ip,
    });
    throw new AppError(
      "Security Alert: Token reuse detected! All devices have been logged out.",
      403,
    );
  }

  const newRefreshToken = `${sessionId}.${crypto.randomBytes(32).toString("hex")}`;
  session.refreshHash = hashToken(newRefreshToken);
  session.ip = ip;
  session.lastUsedAt = new Date().toISOString();

  const authVer = (await redisClient.get(`auth:ver:${actorId}`)) || "1";
  await redisClient.set(
    `sess:${actorId}:${sessionId}`,
    JSON.stringify(session),
    "EX",
    604800,
  );

  return {
    actorId,
    merchantId: session.merchantId || actorId,
    staffId: session.staffId || null,
    role: session.role,
    sessionId,
    newRefreshToken,
    authVer,
  };
};

/**
 * 💥 3. Force Logout All Devices for a Specific Actor (Owner OR Fired Staff)
 */
export const revokeAllUserSessions = async (actorId) => {
  const sessionIds = await redisClient.smembers(`sess:list:${actorId}`);
  const pipeline = redisClient.pipeline();
  pipeline.incr(`auth:ver:${actorId}`);
  for (const sid of sessionIds) {
    pipeline.del(`sess:${actorId}:${sid}`);
    pipeline.del(`sess:lookup:${sid}`);
  }
  pipeline.del(`sess:list:${actorId}`);
  await pipeline.exec();
  return { revokedDevicesCount: sessionIds.length };
};