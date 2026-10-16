import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { productTypeEnum, productStatusEnum } from "./enums.js";

// PRODUCT SCHEMA: Core Catalogue Item
 
export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    slug: varchar("slug", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"), 
    images: jsonb("images").default([]),
    basePrice: decimal("base_price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    regionalPrices: jsonb("regional_prices").default({}), // { "US": 10.99, "EU": 9.99 }
    trackInventory: boolean("track_inventory").default(true),
    stockCount: integer("stock_count").default(0),
    productType: productTypeEnum("product_type", { length: 50 }).default("physical"),
    weightGrams: integer("weight_grams").default(0), // Courier weight calculation ke liye
    dimensions: jsonb("dimensions").default({ length: 0, width: 0, height: 0 }),
    variantsMatrix: jsonb("variants_matrix").default({}), // UI Display: { sizes: ["SM", "MD", "LG"] }
    status: productStatusEnum("status", { length: 20 }).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      merchantIdx: index("product_merchant_idx").on(table.merchantId),
      slugIdx: index("product_slug_idx").on(table.slug),
    };
  },
);