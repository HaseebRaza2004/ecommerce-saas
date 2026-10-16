import {
  pgTable,
  uuid,
  integer,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { products } from "./product.js";
import { customers } from "./customer.js";
import { orders } from "./order.js";
import { reviewStatusEnum } from "./enums.js";

/**
 * ⭐ PRODUCT REVIEWS SCHEMA (Blueprint Phase 1 - Section 5: No Review Gating)
 * Why: Verified purchases auto-publish; merchants can reply to negative reviews but cannot delete them.
 */
export const productReviews = pgTable(
  "product_reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    orderId: uuid("order_id").references(() => orders.id, {
      onDelete: "set null",
    }), // Proof of delivered order

    rating: integer("rating").notNull(), // Backend validates 1 to 5 stars
    comment: text("comment"),
    images: jsonb("images").notNull().default([]), // Customer uploaded review photos (Phase 8)

    // 🛡️ Anti-Fake Review & No Review Gating Logic
    isVerifiedPurchase: boolean("is_verified_purchase")
      .notNull()
      .default(false),
    status: reviewStatusEnum("status").notNull().default("pending"), // Auto 'published' if verified

    // Merchant Official Response (Merchant can only reply, not delete verified reviews)
    merchantReply: text("merchant_reply"),
    repliedAt: timestamp("replied_at"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    revProductIdx: index("rev_product_idx").on(table.productId),
    revMerchantIdx: index("rev_merchant_idx").on(table.merchantId),
    revCustomerIdx: index("rev_customer_idx").on(table.customerId),
  }),
);
