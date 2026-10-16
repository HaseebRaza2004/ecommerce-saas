import {
  pgTable,
  uuid,
  varchar,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";

// MERCHANT COURIERS SCHEMA: Stores Unlimited (30+) Third-Party Logistics APIs per Merchant
 
export const merchantCouriers = pgTable(
  "merchant_couriers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    providerCode: varchar("provider_code", { length: 50 }).notNull(), // e.g., "DHL", "FEDEX", "TCS", "LEOPARDS", "IN_HOUSE"
    displayName: varchar("display_name", { length: 100 }).notNull(), // e.g., "DHL Express Europe"

    // 🔐 Encrypted API Keys (Account No, API Key, Secret, Webhook Secret)
    apiCredentials: jsonb("api_credentials").notNull().default({}),

    // 🏭 Factory / Warehouse Pickup Address for Automated Courier Pickup Requests:
    // { contactName, phone, country, city, postalCode, streetAddress, nearestLandmark, coordinates }
    pickupAddress: jsonb("pickup_address").notNull().default({}),

    autoTriggerPickup: boolean("auto_trigger_pickup").notNull().default(true), // Order confirm hote hi pickup req bheje
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    courierMerchantIdx: index("courier_merchant_idx").on(table.merchantId),
  }),
);
