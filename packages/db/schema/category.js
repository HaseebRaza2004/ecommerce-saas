import { pgTable, uuid, varchar, timestamp, index } from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";

// CATEGORY SCHEMA: Supports Unlimited Nested Sub-Categories (e.g., Wire -> Copper Wire)
 
export const categories = pgTable(
  "categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull(),
    parentId: uuid("parent_id"), 
    path: varchar("path", { length: 500 }).notNull(), 
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      catMerchantIdx: index("cat_merchant_idx").on(table.merchantId),
      catPathIdx: index("cat_path_idx").on(table.path),
    };
  },
);