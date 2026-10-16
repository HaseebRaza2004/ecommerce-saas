import {
  pgTable,
  uuid,
  varchar,
  integer,
  decimal,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { orders } from "./order.js";
import { products } from "./product.js";
import { productVariants } from "./variant.js";

// ORDER ITEM SCHEMA: Locks Variant Price at Time of Purchase

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    orderId: uuid("order_id")
      .references(() => orders.id, { onDelete: "cascade" })
      .notNull(),
    productId: uuid("product_id").references(() => products.id),
    variantId: uuid("variant_id").references(() => productVariants.id), // Selected Size/Number
    title: varchar("title", { length: 255 }).notNull(),
    variantTitle: varchar("variant_title", { length: 150 }), // e.g., "LG" or "Copper - 42"
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => {
    return {
      itemOrderIdx: index("item_order_idx").on(table.orderId),
      itemMerchantIdx: index("item_merchant_idx").on(table.merchantId),
    };
  },
);