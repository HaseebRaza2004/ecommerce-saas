import {
  pgTable,
  uuid,
  varchar,
  decimal,
  boolean,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { desc } from "drizzle-orm";

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id)
      .notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    // desc:
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    trackInventory: boolean("track_inventory").default(true),
    stockCount: integer("stock_count").default(0),
    productType: varchar("product_type", { length: 50 }).default("physical"),
    variantsMatrix: jsonb("variants_matrix"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      // ⚡ Performance Hack: Har merchant ki products fast load hongi
      merchantIdx: index("product_merchant_idx").on(table.merchantId),
      slugIdx: index("product_slug_idx").on(table.slug), // SEO & Fast PDP rendering
    };
  },
);