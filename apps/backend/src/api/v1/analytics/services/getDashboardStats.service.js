import { sql } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

// Service to retrieve live dashboard KPIs for a merchant
export const getDashboardStatsService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "analytics:dashboard_kpis",
    async () => {
      const [orderStats, catalogStats, customerStats] = await Promise.all([
        sql`
          SELECT
            COUNT(*)::int AS total_orders,
            COUNT(*) FILTER (WHERE order_status IN ('pending_payment', 'pending_verification', 'processing'))::int AS active_pending_orders,
            COUNT(*) FILTER (WHERE order_status = 'delivered')::int AS delivered_orders,
            COUNT(*) FILTER (WHERE order_status IN ('cancelled', 'returned'))::int AS cancelled_or_returned,
            COALESCE(SUM(grand_total) FILTER (WHERE order_status = 'delivered' OR payment_status = 'paid'), 0)::numeric(12,2) AS realized_revenue_pkr,
            COALESCE(SUM(grand_total) FILTER (WHERE order_status NOT IN ('cancelled', 'returned')), 0)::numeric(12,2) AS gross_order_value_pkr
          FROM orders
          WHERE merchant_id = ${merchantId};
        `,
        sql`
          SELECT
            (SELECT COUNT(*)::int FROM products WHERE merchant_id = ${merchantId}) AS total_products,
            (SELECT COUNT(*)::int FROM product_variants WHERE merchant_id = ${merchantId} AND stock_count <= 5) AS low_stock_variants
        `,
        sql`
          SELECT
            COUNT(*)::int AS total_customers,
            COUNT(*) FILTER (WHERE is_guest = false)::int AS registered_customers
          FROM customers
          WHERE merchant_id = ${merchantId};
        `,
      ]);

      return {
        currency: "PKR",
        orders: orderStats[0],
        catalog: catalogStats[0],
        customers: customerStats[0],
        generated_at: new Date().toISOString(),
      };
    },
    300,
  );
};