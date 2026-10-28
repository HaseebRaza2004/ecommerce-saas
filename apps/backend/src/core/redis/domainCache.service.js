import { redisClient } from "../../config/redis.client.js";

// Sync Domain Cache: Store or Remove Tenant Data by Domain
export const syncDomainCache = async (
  newDomain,
  tenantData,
  oldDomain = null,
) => {
  try {
    if (oldDomain) {
      await redisClient.del(`tenant:domain:${oldDomain.toLowerCase().trim()}`);
    }
    if (newDomain && tenantData) {
      await redisClient.set(
        `tenant:domain:${newDomain.toLowerCase().trim()}`,
        JSON.stringify(tenantData),
        "EX",
        86400,
      );
    }
    return true;
  } catch (error) {
    console.error("⚠️ Domain Cache Sync Error:", error.message);
    return false;
  }
};