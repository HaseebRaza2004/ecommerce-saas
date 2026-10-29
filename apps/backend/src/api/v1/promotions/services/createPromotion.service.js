import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { promotions } = schema;

// Create Store Promotion or Promo Code (Prevents Duplicate Codes per Store)
export const createPromotionService = async (merchantId, data) => {
  if (data.code) {
    const existing = await db
      .select({ id: promotions.id })
      .from(promotions)
      .where(
        and(
          eq(promotions.merchantId, merchantId),
          eq(promotions.code, data.code),
        ),
      )
      .limit(1);

    if (existing.length > 0) {
      throw new AppError(
        `Promo code '${data.code}' already exists in your store.`,
        409,
      );
    }
  }

  const [created] = await db
    .insert(promotions)
    .values({
      merchantId,
      type: data.type,
      code: data.code,
      discountValue: data.discountValue,
      discountType: data.discountType,
      targetIds: data.targetIds,
      usageLimit: data.usageLimit,
      usedCount: 0,
      canStack: data.canStack,
      expiresAt: data.expiresAt,
    })
    .returning();

  await invalidateTenantCache(merchantId);
  return created;
};