import { redisClient } from "../../config/redis.client.js";
import { sanitizeSegment, buildTenantCacheKey } from "./cacheKey.util.js";

//  Get Cached Data for Tenant
export const getTenantCache = async (merchantId, resourceKey) => {
  try {
    if (!merchantId || !resourceKey) return null;
    const fullKey = await buildTenantCacheKey(merchantId, resourceKey);
    const raw = await redisClient.get(fullKey);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("⚠️ Redis Read Error:", error.message);
    return null;
  }
};

// Set Cached Data for Tenant with TTL (default 1 hour)
export const setTenantCache = async (
  merchantId,
  resourceKey,
  data,
  ttlSeconds = 3600,
) => {
  try {
    if (!merchantId || !resourceKey || data === undefined) return false;
    const fullKey = await buildTenantCacheKey(merchantId, resourceKey);
    await redisClient.set(fullKey, JSON.stringify(data), "EX", ttlSeconds);
    return true;
  } catch (error) {
    console.error("⚠️ Redis Write Error:", error.message);
    return false;
  }
};

// Invalidate Tenant Cache by Incrementing Version
export const invalidateTenantCache = async (merchantId) => {
  try {
    if (!merchantId) return false;
    const safeId = sanitizeSegment(merchantId);
    await redisClient.incr(`tenant:${safeId}:version`);
    return true;
  } catch (error) {
    console.error("⚠️ Redis Invalidate Error:", error.message);
    return false;
  }
};