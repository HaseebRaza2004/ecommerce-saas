import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { products } from "./product.js";

// VARIANT SCHEMA: Handles Sizes (SM, MD, LG or Numbers) with Separate Rates & Stock Security/Concurrency: Normalized table allows row-level locking during flash sales.
 
export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    title: varchar("title", { length: 150 }).notNull(), // e.g., "SM", "LG", "42", "3/29 Copper"
    options: jsonb("options").notNull().default({}), // e.g., { size: "LG" } or { number: 42 }
    sku: varchar("sku", { length: 100 }).notNull(),
    barcode: varchar("barcode", { length: 100 }), // POS Scanner support
    price: decimal("price", { precision: 10, scale: 2 }).notNull(), // ✅ Har size/number ka alag rate
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    regionalPrices: jsonb("regional_prices").default({}), // { "US": 10.99, "EU": 9.99 }
    stockCount: integer("stock_count").notNull().default(0), // ✅ Har size ka alag stock
    weightGrams: integer("weight_grams").default(0),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      variantProductIdx: index("variant_product_idx").on(table.productId),
      variantMerchantIdx: index("variant_merchant_idx").on(table.merchantId),
      variantSkuIdx: index("variant_sku_idx").on(table.sku),
    };
  },
);