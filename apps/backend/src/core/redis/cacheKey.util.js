import { redisClient } from "../../config/redis.client.js";

// Sanitize Key Segments to prevent Redis key-injection attacks
export const sanitizeSegment = (segment) => {
  return String(segment).replace(/[^a-zA-Z0-9:_-]/g, "");
};

// Get Tenant Cache Version: tenant:{merchantId}:version
export const getTenantCacheVersion = async (merchantId) => {
  const safeId = sanitizeSegment(merchantId);
  const version = await redisClient.get(`tenant:${safeId}:version`);
  return version || "1";
};

// Build Tenant Cache Key: tenant:{merchantId}:v{version}:{resourceKey}
export const buildTenantCacheKey = async (merchantId, resourceKey) => {
  const safeId = sanitizeSegment(merchantId);
  const safeResource = sanitizeSegment(resourceKey);
  const version = await getTenantCacheVersion(safeId);
  return `tenant:${safeId}:v${version}:${safeResource}`;
};