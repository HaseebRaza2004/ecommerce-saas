import { and, eq } from "drizzle-orm";
import { db, sql, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { orders, orderItems } = schema;
const RESTOCK_STATUSES = new Set(["cancelled", "returned"]);

// Update Order Status (Enforces Prepaid PIN Lock & Restores Stock on Cancel/Return)
export const updateOrderStatusService = async (merchantId, data) => {
  const existingRows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, data.orderId), eq(orders.merchantId, merchantId)))
    .limit(1);

  const order = existingRows[0];
  if (!order) {
    throw new AppError("Order not found in your store.", 404);
  }

  // 1. Pillar 2 Anti-Scam Guard: Block manual 'delivered' click on locked prepaid orders
  if (data.orderStatus === "delivered" && order.isPrepaidDeliveryLocked) {
    throw new AppError(
      "Anti-Scam Lock: Prepaid orders cannot be manually marked as Delivered. Use Customer 6-Digit PIN/QR verification.",
      403,
    );
  }

  // 2. Auto-Restore Inventory if transitioning into 'cancelled' or 'returned' for the first time
  const wasAlreadyRestocked = RESTOCK_STATUSES.has(order.orderStatus);
  const shouldRestockNow =
    RESTOCK_STATUSES.has(data.orderStatus) && !wasAlreadyRestocked;

  if (shouldRestockNow) {
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, order.id));
    for (const item of items) {
      if (item.variantId) {
        await sql`UPDATE product_variants SET stock_count = stock_count + ${item.quantity} WHERE id = ${item.variantId} AND merchant_id = ${merchantId};`;
      }
      if (item.productId) {
        await sql`UPDATE products SET stock_count = stock_count + ${item.quantity} WHERE id = ${item.productId} AND merchant_id = ${merchantId};`;
      }
    }
  }

  const [updated] = await db
    .update(orders)
    .set({
      orderStatus: data.orderStatus,
      paymentStatus: data.paymentStatus || order.paymentStatus,
      trackingNumber:
        data.trackingNumber !== undefined
          ? data.trackingNumber
          : order.trackingNumber,
      shippingLabelUrl:
        data.shippingLabelUrl !== undefined
          ? data.shippingLabelUrl
          : order.shippingLabelUrl,
    })
    .where(and(eq(orders.id, order.id), eq(orders.merchantId, merchantId)))
    .returning();

  await invalidateTenantCache(merchantId);
  return updated;
};