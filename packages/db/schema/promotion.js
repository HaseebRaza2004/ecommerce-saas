import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";

//  PROMOTION SCHEMA: Discount Engine & Double-Sale Prevention
 
export const promotions = pgTable(
  "promotions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    type: varchar("type", { length: 50 }).notNull(), // store_wide_sale, promo_code
    code: varchar("code", { length: 50 }),
    discountValue: decimal("discount_value", {
      precision: 10,
      scale: 2,
    }).notNull(),
    discountType: varchar("discount_type", { length: 20 }).notNull(), // fixed_amount, percentage
    targetIds: jsonb("target_ids").default([]),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").default(0),
    canStack: boolean("can_stack").default(false),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      promoMerchantIdx: index("promo_merchant_idx").on(table.merchantId),
      promoCodeIdx: index("promo_code_idx").on(table.code),
    };
  },
);