import { pgTable, uuid, varchar, decimal, index, jsonb, integer } from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { merchantCouriers } from "./courier.js";
import {shippingCalcTypeEnum} from "./enums.js";

// SHIPPING SCHEMA: Logistics & Courier Rate Mapping

export const shippingZones = pgTable(
  "shipping_zones",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    zoneName: varchar("zone_name", { length: 100 }).notNull(),
    courierId: uuid("courier_id")
      .references(() => merchantCouriers.id, { onDelete: "cascade" })
      .notNull(),
    // Target Locations: Countries ISO array ["DE", "FR", "GB"] & optional Cities ["Karachi", "Lahore"]
    countries: jsonb("countries").notNull().default([]), // Empty/["*"] means Global Fallback
    cities: jsonb("cities").notNull().default([]), // Specific cities override
    // 🧮 Cart Shipping Rate Calculation Formula:
    calculationType: shippingCalcTypeEnum("calculation_type")
      .notNull()
      .default("weight_based"),
    flatRate: decimal("flat_rate", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    baseWeightGrams: integer("base_weight_grams").default(1000), // Pehle 1 KG ka base rate
    ratePerExtraKg: decimal("rate_per_extra_kg", {
      precision: 10,
      scale: 2,
    }).default("0.00"), // Har extra KG par kitna charge
    freeShippingMinOrder: decimal("free_shipping_min_order", {
      precision: 10,
      scale: 2,
    }), // Free delivery threshold

    priority: integer("priority").notNull().default(1), // Agar 2 zones match hon toh konsa pehle chale
  },
  (table) => {
    return {
      shipMerchantIdx: index("ship_merchant_idx").on(table.merchantId),
      shipCourierIdx: index("ship_courier_idx").on(table.courierId),
    };
  },
);
