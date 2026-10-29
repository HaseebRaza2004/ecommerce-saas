import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

const { promotions } = schema;

// Partial-Cart Loop & Double-Sale Prevention Engine
export const evaluatePromoForCart = async (
  merchantId,
  promoCode,
  enrichedLineItems,
) => {
  if (!promoCode) return { discountTotal: 0, appliedPromo: null };

  const cleanCode = String(promoCode).toUpperCase().trim();
  const rows = await db
    .select()
    .from(promotions)
    .where(
      and(
        eq(promotions.merchantId, merchantId),
        eq(promotions.code, cleanCode),
      ),
    )
    .limit(1);

  const promo = rows[0];
  if (!promo) {
    throw new AppError(`Invalid promo code '${cleanCode}'.`, 404);
  }

  if (promo.expiresAt && new Date() > new Date(promo.expiresAt)) {
    throw new AppError(`Promo code '${cleanCode}' has expired.`, 400);
  }

  if (promo.usageLimit !== null && promo.usedCount >= promo.usageLimit) {
    throw new AppError(
      `Promo code '${cleanCode}' usage limit has been reached.`,
      400,
    );
  }

  const targetSet = new Set(
    Array.isArray(promo.targetIds) ? promo.targetIds : [],
  );
  let eligibleSubtotal = 0;

  // Partial Cart Loop: Only sum items that match targetIds and stacking rules
  for (const item of enrichedLineItems) {
    const isTargetMatch = targetSet.size === 0 || targetSet.has(item.productId);
    const isAlreadyOnSale =
      item.compareAtPrice &&
      Number(item.compareAtPrice) > Number(item.unitPrice);

    if (isTargetMatch && (promo.canStack || !isAlreadyOnSale)) {
      eligibleSubtotal += item.lineTotal;
    }
  }

  if (eligibleSubtotal <= 0) {
    throw new AppError(
      "This promo code is not eligible for the items in your cart (or cannot stack with active sales).",
      422,
    );
  }

  const val = Number(promo.discountValue);
  const rawDiscount =
    promo.discountType === "percentage" ? (eligibleSubtotal * val) / 100 : val;

  // Never allow discount to exceed the eligible items' subtotal
  const finalDiscount = Math.min(
    eligibleSubtotal,
    Number(rawDiscount.toFixed(2)),
  );

  return {
    discountTotal: finalDiscount,
    appliedPromo: {
      id: promo.id,
      code: promo.code,
      discountType: promo.discountType,
      discountValue: promo.discountValue,
      discountAmount: finalDiscount.toFixed(2),
    },
  };
};