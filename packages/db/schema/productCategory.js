import { pgTable, uuid, primaryKey, index } from "drizzle-orm/pg-core";
import { products } from "./product.js";
import { categories } from "./category.js";

// PRODUCT_CATEGORY JUNCTION: Links a Product to Main & Sub-Categories

export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id")
      .references(() => products.id, { onDelete: "cascade" })
      .notNull(),
    categoryId: uuid("category_id")
      .references(() => categories.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.productId, table.categoryId] }),
      prodCatIdx: index("prod_cat_idx").on(table.categoryId),
    };
  },
);