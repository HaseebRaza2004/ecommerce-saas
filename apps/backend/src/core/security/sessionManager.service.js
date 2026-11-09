import crypto from "crypto";
import { redisClient } from "../../config/redis.client.js";
import { AppError } from "../errors/AppError.js";
import { logSecurityEvent } from "../../utils/logger.js";

const hashToken = (t) =>
  crypto.createHash("sha256").update(String(t)).digest("hex");

// Create Device-Tracked Session & Refresh Token in Redis (7-Day TTL)
export const createDeviceSession = async (userId, role, ip, userAgent) => {
  const sessionId = crypto.randomUUID();
  const rawRefreshToken = `${sessionId}.${crypto.randomBytes(32).toString("hex")}`;
  const refreshHash = hashToken(rawRefreshToken);

  const authVer = (await redisClient.get(`auth:ver:${userId}`)) || "1";
  const sessionData = {
    sessionId,
    userId,
    role,
    refreshHash,
    ip,
    device: String(userAgent || "Unknown Device").slice(0, 120),
    createdAt: new Date().toISOString(),
    lastUsedAt: new Date().toISOString(),
  };

  await Promise.all([
    redisClient.set(
      `sess:${userId}:${sessionId}`,
      JSON.stringify(sessionData),
      "EX",
      604800,
    ),
    redisClient.sadd(`sess:list:${userId}`, sessionId),
    redisClient.set(
      `sess:lookup:${sessionId}`,
      JSON.stringify({ userId }),
      "EX",
      604800,
    ),
  ]);

  return { sessionId, rawRefreshToken, authVer };
};

// Refresh Token Rotation + Theft Reuse Detection
export const rotateRefreshTokenService = async (
  rawRefreshToken,
  ip,
  userAgent,
) => {
  if (!rawRefreshToken || !rawRefreshToken.includes(".")) {
    throw new AppError("Invalid refresh token format.", 401);
  }
  const [sessionId] = rawRefreshToken.split(".");
  const incomingHash = hashToken(rawRefreshToken);

  // Locate session metadata
  const rawSession = await redisClient.get(`sess:lookup:${sessionId}`);
  if (!rawSession)
    throw new AppError("Session expired. Please log in again.", 401);

  const { userId } = JSON.parse(rawSession);
  const fullRaw = await redisClient.get(`sess:${userId}:${sessionId}`);
  if (!fullRaw) throw new AppError("Session has been terminated.", 401);

  const session = JSON.parse(fullRaw);

  //  THEFT REUSE DETECTION: If hash doesn't match, an old rotated token was replayed!
  if (session.refreshHash !== incomingHash) {
    await revokeAllUserSessions(userId);
    await logSecurityEvent("REFRESH_TOKEN_THEFT_DETECTED_ALL_SESSIONS_NUKED", {
      userId,
      ip,
    });
    throw new AppError(
      "Security Alert: Token reuse detected! All sessions have been terminated.",
      403,
    );
  }

  const newRefreshToken = `${sessionId}.${crypto.randomBytes(32).toString("hex")}`;
  session.refreshHash = hashToken(newRefreshToken);
  session.ip = ip;
  session.lastUsedAt = new Date().toISOString();

  const authVer = (await redisClient.get(`auth:ver:${userId}`)) || "1";
  await redisClient.set(
    `sess:${userId}:${sessionId}`,
    JSON.stringify(session),
    "EX",
    604800,
  );

  return { userId, role: session.role, sessionId, newRefreshToken, authVer };
};

// Force Logout All Devices Instantly (O(1) Auth Version Bump + Session Wipe)
export const revokeAllUserSessions = async (userId) => {
  const sessionIds = await redisClient.smembers(`sess:list:${userId}`);
  const pipeline = redisClient.pipeline();
  pipeline.incr(`auth:ver:${userId}`);
  for (const sid of sessionIds) {
    pipeline.del(`sess:${userId}:${sid}`);
    pipeline.del(`sess:lookup:${sid}`);
  }
  pipeline.del(`sess:list:${userId}`);
  await pipeline.exec();
  return { revokedDevicesCount: sessionIds.length };
};