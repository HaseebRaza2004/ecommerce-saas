import { redisClient } from "../../config/redis.client.js";
import { sanitizeSegment, buildTenantCacheKey } from "./cacheKey.util.js";
import { getL1Cache, setL1Cache, clearL1ByPrefix } from "./l1Cache.util.js";

// Get Tenant Cache: Retrieve data from L1 RAM or L2 Redis
export const getTenantCache = async (merchantId, resourceKey) => {
  try {
    if (!merchantId || !resourceKey) return null;
    const fullKey = await buildTenantCacheKey(merchantId, resourceKey);

    // 1. Check L1 RAM Cache (<0.5ms)
    const l1Hit = getL1Cache(fullKey);
    if (l1Hit !== null) return l1Hit;

    // 2. Fallback to L2 Upstash Redis
    const raw = await redisClient.get(fullKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    setL1Cache(fullKey, parsed, 15);
    return parsed;
  } catch (error) {
    console.error("⚠️ Redis Read Error:", error.message);
    return null;
  }
};

// Set Tenant Cache: Store data in both L1 RAM and L2 Redis with TTL
export const setTenantCache = async (
  merchantId,
  resourceKey,
  data,
  ttlSeconds = 3600,
) => {
  try {
    if (!merchantId || !resourceKey || data === undefined) return false;
    const fullKey = await buildTenantCacheKey(merchantId, resourceKey);

    setL1Cache(fullKey, data, Math.min(ttlSeconds, 15));
    await redisClient.set(fullKey, JSON.stringify(data), "EX", ttlSeconds);
    return true;
  } catch (error) {
    console.error("⚠️ Redis Write Error:", error.message);
    return false;
  }
};

// Invalidate Tenant Cache: Increment version to invalidate all keys for a merchant
export const invalidateTenantCache = async (merchantId) => {
  try {
    if (!merchantId) return false;
    const safeId = sanitizeSegment(merchantId);
    clearL1ByPrefix(`tenant:${safeId}:`);
    await redisClient.incr(`tenant:${safeId}:version`);
    return true;
  } catch (error) {
    console.error("⚠️ Redis Invalidate Error:", error.message);
    return false;
  }
};