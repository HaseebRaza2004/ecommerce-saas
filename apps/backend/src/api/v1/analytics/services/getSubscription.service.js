import { eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { merchantSubscriptions } = schema;

// Matches planNameEnum ('basic', 'standard', 'enterprise') in subscription.js
const PLAN_FEATURES = {
  basic: {
    max_products: 500,
    allow_promo_codes: true,
    pos: false,
    erp: false,
    max_staff: 3,
  },
  standard: {
    max_products: 5000,
    allow_promo_codes: true,
    pos: true,
    erp: false,
    max_staff: 15,
  },
  enterprise: {
    max_products: 100000,
    allow_promo_codes: true,
    pos: true,
    erp: true,
    max_staff: 100,
  },
};

// Get Current Subscription Plan for a Merchant
export const getSubscriptionService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "subscription:current",
    async () => {
      const rows = await db
        .select()
        .from(merchantSubscriptions)
        .where(eq(merchantSubscriptions.merchantId, merchantId))
        .limit(1);
      return rows[0] || null;
    },
    3600,
  );
};

// Upgrade Merchant Subscription Plan
export const upgradeSubscriptionService = async (merchantId, body = {}) => {
  const cleanPlan = String(body.planName || "")
    .toLowerCase()
    .trim();
  if (!PLAN_FEATURES[cleanPlan]) {
    throw new AppError(
      "Invalid planName. Choose 'basic', 'standard', or 'enterprise'.",
      400,
    );
  }

  const cycle = body.billingCycle === "yearly" ? "yearly" : "monthly";
  const daysToAdd = cycle === "yearly" ? 365 : 30;
  const nextBillingDate = new Date(
    Date.now() + daysToAdd * 24 * 60 * 60 * 1000,
  );

  const [updated] = await db
    .update(merchantSubscriptions)
    .set({
      planName: cleanPlan,
      billingCycle: cycle,
      features: PLAN_FEATURES[cleanPlan],
      paymentGateway: body.paymentGateway
        ? String(body.paymentGateway).slice(0, 50)
        : "stripe",
      nextBillingDate,
    })
    .where(eq(merchantSubscriptions.merchantId, merchantId))
    .returning();

  await invalidateTenantCache(merchantId);
  return updated;
};