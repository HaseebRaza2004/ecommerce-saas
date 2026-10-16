import {
  pgTable,
  uuid,
  text,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";

// STORE POLICIES & FAQS SCHEMA: Default legal templates auto-injected on store creation; fully editable by merchant.

export const storePolicies = pgTable(
  "store_policies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    privacyPolicy: text("privacy_policy")
      .notNull()
      .default("Default Privacy Policy..."),
    termsOfService: text("terms_of_service")
      .notNull()
      .default("Default Terms of Service..."),
    refundPolicy: text("refund_policy")
      .notNull()
      .default("Default Refund & Return Policy..."),
    shippingPolicy: text("shipping_policy")
      .notNull()
      .default("Default Shipping Policy..."),
    faqs: jsonb("faqs").notNull().default([]),
    contactDetails: jsonb("contact_details").notNull().default({}),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    policyMerchantIdx: index("policy_merchant_idx").on(table.merchantId),
  }),
);