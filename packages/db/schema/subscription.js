import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { planNameEnum, billingCycleEnum } from "./enums.js";

// 💳 SUBSCRIPTION SCHEMA: Controls Plan Limits & Feature Gating (POS/ERP Access)

export const merchantSubscriptions = pgTable(
  "merchant_subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    planName: planNameEnum("plan_name").notNull().default("basic"), // Basic, Standard, Enterprise
    billingCycle: billingCycleEnum("billing_cycle")
      .notNull()
      .default("monthly"), // monthly, yearly
    features: jsonb("features").notNull().default({}), // Allowed modules e.g., { pos: true }
    paymentGateway: varchar("payment_gateway", { length: 50 })
      .notNull()
      .default("stripe"), // stripe, alipay, yookassa, paytabs
    gatewaySubscriptionId: varchar("gateway_subscription_id", { length: 150 }),
    gatewayCustomerId: varchar("gateway_customer_id", { length: 150 }),
    nextBillingDate: timestamp("next_billing_date"), // 48-hour kill switch trigger
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      subMerchantIdx: index("sub_merchant_idx").on(table.merchantId),
    };
  },
);