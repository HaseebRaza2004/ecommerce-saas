import { sql } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

// Duplicate TID Pre-Check + Atomic Stock & Promo Lock
export const lockInventoryAndPromoAtomically = async (
  merchantId,
  lineItems,
  appliedPromo,
  bankTransactionId = null,
) => {
  // 0. Pre-Check Duplicate Bank TID BEFORE touching inventory
  if (bankTransactionId) {
    const existingTid = await sql`
      SELECT id FROM orders WHERE bank_transaction_id = ${bankTransactionId} LIMIT 1;
    `;
    if (existingTid.length > 0) {
      throw new AppError(
        "Fraud Alert: This Bank/Raast Transaction ID (TID) has already been used.",
        409,
      );
    }
  }

  const deductedItems = [];

  try {
    for (const item of lineItems) {
      const updated = await sql`
        UPDATE product_variants
        SET stock_count = stock_count - ${item.quantity}
        WHERE id = ${item.variantId}
          AND merchant_id = ${merchantId}
          AND stock_count >= ${item.quantity}
        RETURNING id;
      `;

      if (updated.length === 0) {
        throw new AppError(
          `Flash Sale Alert: '${item.title} (${item.variantTitle})' just sold out!`,
          409,
        );
      }
      deductedItems.push(item);

      await sql`
        UPDATE products
        SET stock_count = GREATEST(0, stock_count - ${item.quantity})
        WHERE id = ${item.productId} AND merchant_id = ${merchantId};
      `;
    }

    if (appliedPromo?.id) {
      const promoUpdated = await sql`
        UPDATE promotions
        SET used_count = used_count + 1
        WHERE id = ${appliedPromo.id}
          AND merchant_id = ${merchantId}
          AND (usage_limit IS NULL OR used_count < usage_limit)
        RETURNING id;
      `;

      if (promoUpdated.length === 0) {
        throw new AppError(
          "Promo code usage limit was just reached by another buyer.",
          409,
        );
      }
    }
  } catch (error) {
    for (const prev of deductedItems) {
      await sql`
        UPDATE product_variants
        SET stock_count = stock_count + ${prev.quantity}
        WHERE id = ${prev.variantId} AND merchant_id = ${merchantId};
      `;
    }
    throw error;
  }
};