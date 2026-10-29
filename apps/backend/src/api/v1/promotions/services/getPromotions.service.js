import { eq, desc } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { promotions } = schema;

// Retrieve All Promotions for a Merchant (with Caching)
export const getPromotionsService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "promotions:all",
    async () => {
      return await db
        .select()
        .from(promotions)
        .where(eq(promotions.merchantId, merchantId))
        .orderBy(desc(promotions.createdAt));
    },
    1800
  );
};