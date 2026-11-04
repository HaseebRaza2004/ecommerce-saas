import { eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";
import { syncDomainCache } from "../../../../core/redis/domainCache.service.js";

const { merchants } = schema;

// Update Storefront Theme, UI, and Localization Settings for a given merchantId
export const updateStoreThemeService = async (merchantId, data) => {
  const updatePayload = {
    themeConfig: data.themeConfig,
    uiComponents: data.uiComponents,
  };

  if (data.storeName) updatePayload.storeName = data.storeName;
  if (data.localization) updatePayload.localization = data.localization;

  const [updated] = await db
    .update(merchants)
    .set(updatePayload)
    .where(eq(merchants.id, merchantId))
    .returning({
      id: merchants.id,
      storeName: merchants.storeName,
      domainUrl: merchants.domainUrl,
      status: merchants.status,
      themeConfig: merchants.themeConfig,
      uiComponents: merchants.uiComponents,
      localization: merchants.localization,
    });

  if (!updated) {
    throw new AppError("Merchant store not found.", 404);
  }

  await Promise.all([
    invalidateTenantCache(merchantId),
    syncDomainCache(updated.domainUrl, {
      merchant_id: updated.id,
      store_name: updated.storeName,
      domain_url: updated.domainUrl,
      status: updated.status,
    }),
  ]);

  return updated;
};