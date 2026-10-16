import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { staffRoleEnum } from "./enums.js";

export const staffMembers = pgTable(
  "staff_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    password: varchar("password", { length: 255 }).notNull(), // Bcrypt Hashed
    role: staffRoleEnum("role").notNull().default("cashier"), // super_merchant, store_manager, cashier, delivery_rider
    branchId: uuid("branch_id"), 
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    staffMerchantIdx: index("staff_merchant_idx").on(table.merchantId),
    staffEmailIdx: index("staff_email_idx").on(table.email),
  }),
);