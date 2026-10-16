import {
  pgTable,
  uuid,
  varchar,
  boolean,
  jsonb,
  timestamp,
  index,
  decimal,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";

// CUSTOMER SCHEMA: Separate from Admin Auth (Supports Shadow/Guest Accounts)

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    altPhone: varchar("alt_phone", { length: 50 }),
    password: varchar("password", { length: 255 }),
    isGuest: boolean("is_guest").default(true),
    walletBalance: decimal("wallet_balance", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    addresses: jsonb("addresses").default([]),
    savedCards: jsonb("saved_cards").notNull().default([]),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      custMerchantIdx: index("cust_merchant_idx").on(table.merchantId),
      custEmailIdx: index("cust_email_idx").on(table.email),
      custPhoneIdx: index("cust_phone_idx").on(table.phone),
    };
  },
);