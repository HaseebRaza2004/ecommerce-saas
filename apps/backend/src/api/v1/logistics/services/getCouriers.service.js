import { eq, desc } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { merchantCouriers } = schema;

// Fetch all couriers for a merchant with caching
export const getCouriersService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "logistics:couriers",
    async () => {
      const rows = await db
        .select()
        .from(merchantCouriers)
        .where(eq(merchantCouriers.merchantId, merchantId))
        .orderBy(desc(merchantCouriers.createdAt));

      return rows.map((c) => ({
        id: c.id,
        providerCode: c.providerCode,
        displayName: c.displayName,
        pickupAddress: c.pickupAddress,
        autoTriggerPickup: c.autoTriggerPickup,
        isActive: c.isActive,
        has_encrypted_credentials: Boolean(c.apiCredentials?.ciphertext),
        createdAt: c.createdAt,
      }));
    },
    3600,
  );
};