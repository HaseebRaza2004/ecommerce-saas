import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { productReviews, products, orders, orderItems } = schema;

// Verify Delivered Order Proof, Auto-Publish Verified Reviews & Insert Review into DB
export const createReviewService = async (merchantId, data) => {
  const prodRows = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(eq(products.id, data.productId), eq(products.merchantId, merchantId)),
    )
    .limit(1);

  if (!prodRows[0]) {
    throw new AppError("Product not found in this store.", 404);
  }

  // Check proof of delivered order for this exact product + phone
  const deliveredRows = await db
    .select({ orderId: orders.id, customerId: orders.customerId })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(
      and(
        eq(orders.merchantId, merchantId),
        eq(orders.customerPhone, data.customerPhone),
        eq(orders.orderStatus, "delivered"),
        eq(orderItems.productId, data.productId),
      ),
    )
    .limit(1);

  const isVerifiedPurchase = deliveredRows.length > 0;
  const proofOrderId = deliveredRows[0]?.orderId || null;
  const proofCustomerId = deliveredRows[0]?.customerId || null;

//   Set review status based on verification
  const status = isVerifiedPurchase ? "published" : "pending";

  const [created] = await db
    .insert(productReviews)
    .values({
      merchantId,
      productId: data.productId,
      customerId: proofCustomerId,
      orderId: proofOrderId,
      rating: data.rating,
      comment: data.comment,
      images: data.images,
      isVerifiedPurchase,
      status,
    })
    .returning();

  await invalidateTenantCache(merchantId);
  return created;
};