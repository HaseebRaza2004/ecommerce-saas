import { and, eq, desc } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { customers, orders } = schema;

// Fetch Logged-In Customer Profile, Saved Addresses & Order History (Cached)
export const getCustomerProfileService = async (merchantId, customerId) => {
  return await getOrSetTenantCache(
    merchantId,
    `customer:profile:${customerId}`,
    async () => {
      const [custRows, orderHistory] = await Promise.all([
        db
          .select({
            id: customers.id,
            name: customers.name,
            email: customers.email,
            phone: customers.phone,
            altPhone: customers.altPhone,
            addresses: customers.addresses,
            createdAt: customers.createdAt,
          })
          .from(customers)
          .where(
            and(
              eq(customers.id, customerId),
              eq(customers.merchantId, merchantId),
            ),
          )
          .limit(1),
        db
          .select({
            id: orders.id,
            orderNumber: orders.orderNumber,
            orderStatus: orders.orderStatus,
            paymentStatus: orders.paymentStatus,
            grandTotal: orders.grandTotal,
            trackingNumber: orders.trackingNumber,
            createdAt: orders.createdAt,
          })
          .from(orders)
          .where(
            and(
              eq(orders.merchantId, merchantId),
              eq(orders.customerId, customerId),
            ),
          )
          .orderBy(desc(orders.createdAt))
          .limit(20),
      ]);

      if (!custRows[0]) {
        throw new AppError("Customer profile not found.", 404);
      }

      return {
        ...custRows[0],
        orders: orderHistory,
      };
    },
    900,
  );
};