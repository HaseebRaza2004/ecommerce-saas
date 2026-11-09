import { redisClient } from "../config/redis.client.js";

// Structured Security & Audit Logger
export const logSecurityEvent = async (eventType, details = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    event: eventType,
    ...details,
  };

  console.warn(`🛡️ [SECURITY AUDIT] ${eventType}:`, JSON.stringify(entry));

  try {
    if (details.merchantId) {
      const auditKey = `audit:sec:${details.merchantId}`;
      const pipeline = redisClient.pipeline();
      pipeline.lpush(auditKey, JSON.stringify(entry));
      pipeline.ltrim(auditKey, 0, 99); 
      pipeline.expire(auditKey, 604800); 
      await pipeline.exec();
    }
  } catch {
    // Non-blocking fail-open if Redis blips
  }
};