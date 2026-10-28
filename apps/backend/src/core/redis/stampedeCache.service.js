import { redisClient } from "../../config/redis.client.js";
import { sanitizeSegment } from "./cacheKey.util.js";
import { getTenantCache, setTenantCache } from "./tenantCache.service.js";

// Stampede Guard: Prevent Cache Stampedes by using a distributed lock
export const getOrSetTenantCache = async (
  merchantId,
  resourceKey,
  fetchFn,
  ttlSeconds = 3600,
) => {
  const cached = await getTenantCache(merchantId, resourceKey);
  if (cached !== null) return cached;

  const lockKey = `lock:tenant:${sanitizeSegment(merchantId)}:${sanitizeSegment(resourceKey)}`;

  try {
    const lockAcquired = await redisClient.set(
      lockKey,
      "LOCKED",
      "PX",
      3000,
      "NX",
    );

    if (lockAcquired === "OK") {
      const freshData = await fetchFn();
      if (freshData !== null && freshData !== undefined) {
        await setTenantCache(merchantId, resourceKey, freshData, ttlSeconds);
      }
      await redisClient.del(lockKey);
      return freshData;
    }

    // Follower requests wait 80ms and check cache again
    await new Promise((resolve) => setTimeout(resolve, 80));
    const retryCache = await getTenantCache(merchantId, resourceKey);
    return retryCache !== null ? retryCache : await fetchFn();
  } catch (error) {
    console.error("⚠️ Stampede Guard Error:", error.message);
    return await fetchFn();
  }
};