import { eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { merchants } = schema;

// Admin Profile Service: Fetch Admin Profile with Stampede Guard Caching
export const getAdminProfileService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "profile:me",
    async () => {
      const rows = await db
        .select({
          merchant_id: merchants.id,
          store_name: merchants.storeName,
          domain_url: merchants.domainUrl,
          email: merchants.email,
          phone: merchants.phone,
          db_region: merchants.dbRegion,
          status: merchants.status,
          theme_config: merchants.themeConfig,
          ui_components: merchants.uiComponents,
          localization: merchants.localization,
          created_at: merchants.createdAt,
        })
        .from(merchants)
        .where(eq(merchants.id, merchantId))
        .limit(1);

      if (!rows[0]) {
        throw new AppError("Merchant account not found.", 404);
      }
      return rows[0];
    },
    1800
  );
};