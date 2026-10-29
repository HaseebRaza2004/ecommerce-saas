import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { evaluatePromoForCart } from "../../promotions/services/evaluatePromo.service.js";

const { productVariants, products } = schema;

// Calculate Cart Quote Service (Subtotal, Discounts, Grand Total)
export const calculateCartQuoteService = async (
  merchantId,
  { items, promoCode },
) => {
  const variantIds = items.map((i) => i.variantId);

  // Fetch authoritative variant prices, stock & parent product settings from NeonDB
  const dbRows = await db
    .select({
      variantId: productVariants.id,
      productId: products.id,
      productTitle: products.title,
      variantTitle: productVariants.title,
      sku: productVariants.sku,
      unitPrice: productVariants.price,
      compareAtPrice: productVariants.compareAtPrice,
      variantStock: productVariants.stockCount,
      trackInventory: products.trackInventory,
      weightGrams: productVariants.weightGrams,
      productWeight: products.weightGrams,
      productType: products.productType,
    })
    .from(productVariants)
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(
      and(
        eq(productVariants.merchantId, merchantId),
        inArray(productVariants.id, variantIds),
      ),
    );

  if (dbRows.length !== variantIds.length) {
    throw new AppError(
      "One or more items in your cart are no longer available.",
      404,
    );
  }

  const rowMap = new Map(dbRows.map((r) => [r.variantId, r]));
  let subtotal = 0;
  let totalWeightGrams = 0;

  const lineItems = items.map(({ variantId, quantity }) => {
    const dbItem = rowMap.get(variantId);

    // Enforce inventory check unless trackInventory magic toggle is false (Blueprint Table 2.1)
    if (dbItem.trackInventory && dbItem.variantStock < quantity) {
      throw new AppError(
        `Insufficient stock for '${dbItem.productTitle} (${dbItem.variantTitle})'. Only ${dbItem.variantStock} left.`,
        409,
      );
    }

    const priceNum = Number(dbItem.unitPrice);
    const lineTotal = Number((priceNum * quantity).toFixed(2));
    const itemWeight =
      (dbItem.weightGrams || dbItem.productWeight || 0) * quantity;

    subtotal += lineTotal;
    totalWeightGrams += itemWeight;

    return {
      productId: dbItem.productId,
      variantId: dbItem.variantId,
      title: dbItem.productTitle,
      variantTitle: dbItem.variantTitle,
      sku: dbItem.sku,
      quantity,
      unitPrice: priceNum.toFixed(2),
      compareAtPrice: dbItem.compareAtPrice,
      lineTotal,
      weightGrams: itemWeight,
    };
  });

  const { discountTotal, appliedPromo } = await evaluatePromoForCart(
    merchantId,
    promoCode,
    lineItems,
  );
  const grandTotal = Math.max(0, Number((subtotal - discountTotal).toFixed(2)));

  return {
    currency: "PKR",
    total_items: items.reduce((acc, i) => acc + i.quantity, 0),
    total_weight_grams: totalWeightGrams,
    subtotal: subtotal.toFixed(2),
    discount_total: discountTotal.toFixed(2),
    grand_total: grandTotal.toFixed(2),
    applied_promo: appliedPromo,
    items: lineItems,
  };
};