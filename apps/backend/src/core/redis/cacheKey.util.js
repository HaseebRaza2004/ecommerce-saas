import { redisClient } from "../../config/redis.client.js";
import { getL1Cache, setL1Cache } from "./l1Cache.util.js";

// Sanitize Key Segments to prevent Redis key-injection attacks
export const sanitizeSegment = (segment) => {
  return String(segment).replace(/[^a-zA-Z0-9:_-]/g, "");
};

// Get Tenant Cache Version: tenant:{merchantId}:version
export const getTenantCacheVersion = async (merchantId) => {
  const safeId = sanitizeSegment(merchantId);
  const versionKey = `tenant:${safeId}:version`;
  const l1Version = getL1Cache(versionKey);
  if (l1Version) return l1Version;

  const version = (await redisClient.get(versionKey)) || "1";
  setL1Cache(versionKey, version, 30); // Cache version in RAM for 30s
  return version;
};

// Build Tenant Cache Key: tenant:{merchantId}:v{version}:{resourceKey}
export const buildTenantCacheKey = async (merchantId, resourceKey) => {
  const safeId = sanitizeSegment(merchantId);
  const safeResource = sanitizeSegment(resourceKey);
  const version = await getTenantCacheVersion(safeId);
  return `tenant:${safeId}:v${version}:${safeResource}`;
};
