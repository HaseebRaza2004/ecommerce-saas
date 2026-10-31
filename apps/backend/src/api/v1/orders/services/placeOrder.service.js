import crypto from "crypto";
import { db, schema } from "../../../../config/db.client.js";
import { redisClient } from "../../../../config/redis.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";
import { calculateCartQuoteService } from "../../cart/services/calculateCartQuote.service.js";
import { calculateShippingService } from "../../logistics/services/calculateShipping.service.js";
import { resolveShadowCustomerService } from "./shadowCustomer.service.js";
import { lockInventoryAndPromoAtomically } from "./atomicStockLock.service.js";

const { orders, orderItems } = schema;

// Master Checkout Orchestrator (Zero-Trust Pricing + Atomic Stock + Delivery PIN Lock)
export const placeOrderService = async (merchantId, data) => {
  // 1. Redis Idempotency Shield (Blocks duplicate clicks in <2ms)
  const idemRedisKey = `idem:order:${merchantId}:${data.idempotencyKey}`;
  const isFirstAttempt = await redisClient.set(
    idemRedisKey,
    "PROCESSING",
    "EX",
    86400,
    "NX",
  );
  if (isFirstAttempt !== "OK") {
    throw new AppError(
      "Duplicate order submission detected. Your order is already being processed.",
      409,
    );
  }

  try {
    // Calculate Authoritative Cart Quote & Resolve Shadow Customer in Parallel
    const [cartQuote, customerId] = await Promise.all([
      calculateCartQuoteService(merchantId, {
        items: data.items,
        promoCode: data.promoCode,
      }),
      resolveShadowCustomerService(merchantId, data),
    ]);

    // Calculate Authoritative Regional Shipping Rate
    const shippingQuote = await calculateShippingService(merchantId, {
      country: data.shippingCountry,
      city: data.shippingCity.toLowerCase(),
      totalWeightGrams: cartQuote.total_weight_grams,
      cartSubtotal: Number(cartQuote.grand_total),
    });

    // Atomically Lock & Deduct Stock + Promo Usage
    await lockInventoryAndPromoAtomically(
      merchantId,
      cartQuote.items,
      cartQuote.applied_promo,
      data.bankTransactionId,
    );

    // Anti-Scam Delivery PIN & QR Token for Prepaid Orders
    const isPrepaid = data.paymentCategory !== "cod";
    const plainDeliveryPin = isPrepaid
      ? String(crypto.randomInt(100000, 1000000))
      : null;
    const deliverySecretPinHash = plainDeliveryPin
      ? crypto.createHash("sha256").update(plainDeliveryPin).digest("hex")
      : null;
    const deliveryQrToken = isPrepaid
      ? `DQR-${crypto.randomBytes(16).toString("hex")}`
      : null;

    const grandTotal = (
      Number(cartQuote.grand_total) + Number(shippingQuote.shipping_total)
    ).toFixed(2);
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}-${crypto.randomInt(100, 999)}`;

    // Insert Order & Order Items Snapshot
    const [createdOrder] = await db
      .insert(orders)
      .values({
        merchantId,
        customerId,
        orderNumber,
        idempotencyKey: data.idempotencyKey,
        source: "web_storefront",
        orderStatus: isPrepaid ? "pending_payment" : "pending_verification",
        paymentStatus: "pending",
        paymentCategory: data.paymentCategory,
        paymentMethod: data.paymentMethod,
        bankTransactionId: data.bankTransactionId,
        baseCurrency: "PKR",
        displayCurrency: data.displayCurrency,
        displayExchangeRate: data.displayExchangeRate,
        subtotal: cartQuote.subtotal,
        discountTotal: cartQuote.discount_total,
        shippingTotal: shippingQuote.shipping_total,
        grandTotal,
        customerPhone: data.customerPhone,
        customerAltPhone: data.customerAltPhone,
        shippingCountry: data.shippingCountry,
        shippingCity: data.shippingCity,
        shippingPostalCode: data.shippingPostalCode,
        nearestLandmark: data.nearestLandmark,
        shippingAddressFull: data.shippingAddressFull,
        shippingCoordinates: data.shippingCoordinates,
        courierId: shippingQuote.courier_id,
        isPrepaidDeliveryLocked: isPrepaid,
        deliverySecretPinHash,
        deliveryQrToken,
        notes: data.notes,
      })
      .returning();

    const itemRows = cartQuote.items.map((item) => ({
      merchantId,
      orderId: createdOrder.id,
      productId: item.productId,
      variantId: item.variantId,
      title: item.title,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.lineTotal.toFixed(2),
    }));

    await db.insert(orderItems).values(itemRows);
    await invalidateTenantCache(merchantId);

    return {
      order_id: createdOrder.id,
      order_number: createdOrder.orderNumber,
      order_status: createdOrder.orderStatus,
      payment_category: createdOrder.paymentCategory,
      base_currency: "PKR",
      subtotal: createdOrder.subtotal,
      discount_total: createdOrder.discountTotal,
      shipping_total: createdOrder.shippingTotal,
      grand_total: createdOrder.grandTotal,
      assigned_courier: shippingQuote.courier_name,
      is_prepaid_delivery_locked: isPrepaid,
      // Shown ONCE to Customer on Order Success screen / WhatsApp Receipt for Rider Handshake
      customer_delivery_secret_pin: plainDeliveryPin,
      customer_delivery_qr_token: deliveryQrToken,
    };
  } catch (error) {
    await redisClient.del(idemRedisKey); // Release lock if validation/stock failed so user can retry
    throw error;
  }
};