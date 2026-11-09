import { redisClient } from "../../config/redis.client.js";
import { AppError } from "../errors/AppError.js";
import { logSecurityEvent } from "../../utils/logger.js";

// Check Account-Level Brute-Force Lock (Stops Distributed Botnet Attacks)
export const checkAccountLockout = async (identifier) => {
  const key = `sec:lockout:${identifier.toLowerCase()}`;
  const failedCount = Number((await redisClient.get(key)) || 0);

  if (failedCount >= 5) {
    throw new AppError(
      "Security Lockout: Account temporarily locked due to 5 failed login attempts. Try again in 15 minutes.",
      429,
    );
  }
};

// Record Failed Login Attempt Against Target Account
export const recordFailedLogin = async (identifier, ip) => {
  const key = `sec:lockout:${identifier.toLowerCase()}`;
  const pipeline = redisClient.pipeline();
  pipeline.incr(key);
  pipeline.call("EXPIRE", key, 900, "NX");
  const results = await pipeline.exec();
  const count = results[0][1];

  if (count >= 5) {
    await logSecurityEvent("ACCOUNT_BRUTE_FORCE_LOCKED", {
      identifier,
      ip,
      attempts: count,
    });
  }
};

// Clear Lockout & Detect Suspicious New IP/Device on Successful Login
export const evaluateLoginAnomaly = async (merchantId, ip, userAgent) => {
  const lockKey = `sec:lockout:${merchantId}`;
  const knownIpKey = `sec:known_ips:${merchantId}`;

  const [, isKnownIp] = await Promise.all([
    redisClient.del(lockKey),
    redisClient.sismember(knownIpKey, ip),
  ]);

  if (!isKnownIp) {
    await redisClient.sadd(knownIpKey, ip);
    await redisClient.expire(knownIpKey, 2592000);
    await logSecurityEvent("SUSPICIOUS_NEW_IP_LOGIN", {
      merchantId,
      ip,
      userAgent,
    });
    return { isNewDeviceOrIp: true };
  }

  return { isNewDeviceOrIp: false };
};