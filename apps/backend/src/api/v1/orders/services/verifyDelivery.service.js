import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { orders } = schema;

// Verify Customer 6-Digit PIN or QR Token to Unlock Prepaid Delivery Status
export const verifyOrderDeliveryService = async (
  merchantId,
  { orderId, secretPin, qrToken },
) => {
  const rows = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.merchantId, merchantId)))
    .limit(1);

  const order = rows[0];
  if (!order) {
    throw new AppError("Order not found in your store.", 404);
  }

  if (order.orderStatus === "delivered") {
    throw new AppError(
      "This order has already been verified and marked as delivered.",
      409,
    );
  }

  // Enforce Cryptographic PIN or QR Handshake for Prepaid Orders
  if (order.isPrepaidDeliveryLocked) {
    let isVerified = false;

    if (secretPin && order.deliverySecretPinHash) {
      const inputHash = crypto
        .createHash("sha256")
        .update(String(secretPin))
        .digest("hex");
      isVerified = inputHash === order.deliverySecretPinHash;
    } else if (qrToken && order.deliveryQrToken) {
      isVerified = qrToken === order.deliveryQrToken;
    }

    if (!isVerified) {
      throw new AppError(
        "Anti-Scam Lock: Invalid Customer Delivery PIN or QR Token. Cannot mark prepaid order as Delivered.",
        403,
      );
    }
  }

  const [updated] = await db
    .update(orders)
    .set({
      orderStatus: "delivered",
      paymentStatus: "paid",
      deliveryVerificationType: order.isPrepaidDeliveryLocked
        ? "rider_qr_pin"
        : "cod_cash_collected",
      deliveryVerifiedAt: new Date(),
    })
    .where(eq(orders.id, order.id))
    .returning({
      id: orders.id,
      orderNumber: orders.orderNumber,
      orderStatus: orders.orderStatus,
      paymentStatus: orders.paymentStatus,
      deliveryVerificationType: orders.deliveryVerificationType,
      deliveryVerifiedAt: orders.deliveryVerifiedAt,
    });

  await invalidateTenantCache(merchantId);
  return updated;
};