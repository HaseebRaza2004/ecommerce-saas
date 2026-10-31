import { and, eq, desc } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { orders, orderItems } = schema;

// Fetch Admin Console Orders List (Redis Cached)
export const getMerchantOrdersService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "orders:admin_list",
    async () => {
      return await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          orderStatus: orders.orderStatus,
          paymentStatus: orders.paymentStatus,
          paymentCategory: orders.paymentCategory,
          paymentMethod: orders.paymentMethod,
          grandTotal: orders.grandTotal,
          customerPhone: orders.customerPhone,
          shippingCity: orders.shippingCity,
          shippingCountry: orders.shippingCountry,
          isPrepaidDeliveryLocked: orders.isPrepaidDeliveryLocked,
          deliveryVerificationType: orders.deliveryVerificationType,
          createdAt: orders.createdAt,
        })
        .from(orders)
        .where(eq(orders.merchantId, merchantId))
        .orderBy(desc(orders.createdAt))
        .limit(50);
    },
    600,
  );
};

// Public Order Tracking Lookup (Order Number + Phone)
export const trackOrderPublicService = async (
  merchantId,
  orderNumber,
  phone,
) => {
  if (!orderNumber || !phone) {
    throw new AppError(
      "Both orderNumber and customer phone are required to track an order.",
      400,
    );
  }

  const cleanOrderNo = String(orderNumber).toUpperCase().trim();
  const cleanPhone = String(phone).trim();

  const rows = await db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.merchantId, merchantId),
        eq(orders.orderNumber, cleanOrderNo),
        eq(orders.customerPhone, cleanPhone),
      ),
    )
    .limit(1);

  if (!rows[0]) {
    throw new AppError(
      "No matching order found with this Order Number and Phone.",
      404,
    );
  }

  const order = rows[0];
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  return {
    order_id: order.id,
    order_number: order.orderNumber,
    order_status: order.orderStatus,
    payment_status: order.paymentStatus,
    payment_method: order.paymentMethod,
    grand_total: order.grandTotal,
    shipping_city: order.shippingCity,
    shipping_country: order.shippingCountry,
    tracking_number: order.trackingNumber,
    is_prepaid_delivery_locked: order.isPrepaidDeliveryLocked,
    delivery_verified_at: order.deliveryVerifiedAt,
    created_at: order.createdAt,
    items,
  };
};