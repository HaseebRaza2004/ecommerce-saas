import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { customers } from "./customer.js";
import { merchantCouriers } from "./courier.js";
import { orderSourceEnum, orderStatusEnum, paymentStatusEnum } from "./enums.js";

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    customerId: uuid("customer_id").references(() => customers.id), // Links to Customer Order History
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 100 }).unique(), // Blueprint Phase 2: Double-charge shield
    
    source: orderSourceEnum("source").notNull().default("web_storefront"),
    orderStatus: orderStatusEnum("order_status").notNull().default("pending_verification"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // COD, Stripe, PayTabs, POS_Cash

    // Financials
    currency: varchar("currency", { length: 10 }).notNull().default("PKR"),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountTotal: decimal("discount_total", { precision: 10, scale: 2 }).notNull().default("0.00"),
    shippingTotal: decimal("shipping_total", { precision: 10, scale: 2 }).notNull().default("0.00"),
    advanceCodPaid: decimal("advance_cod_paid", { precision: 10, scale: 2 }).notNull().default("0.00"), // Blueprint Phase 5
    grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(),

    // 📍 Strict Delivery & Contact Details (Required for Couriers & Riders)
    customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
    customerAltPhone: varchar("customer_alt_phone", { length: 50 }), // Optional 2nd phone
    shippingCountry: varchar("shipping_country", { length: 100 }).notNull(),
    shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
    shippingPostalCode: varchar("shipping_postal_code", { length: 30 }),
    nearestLandmark: varchar("nearest_landmark", { length: 255 }),
    shippingAddressFull: text("shipping_address_full").notNull(),
    shippingCoordinates: jsonb("shipping_coordinates").default({}), // { lat, lng }

    // 🚚 Automated Logistics & Factory Pickup Tracking
    courierId: uuid("courier_id").references(() => merchantCouriers.id), // Auto-assigned regional courier
    trackingNumber: varchar("tracking_number", { length: 150 }),
    shippingLabelUrl: varchar("shipping_label_url", { length: 500 }),
    scheduledPickupDate: timestamp("scheduled_pickup_date"),

    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderMerchantIdx: index("order_merchant_idx").on(table.merchantId),
    orderCustomerIdx: index("order_customer_idx").on(table.customerId), // ⚡ Instant Customer Order History!
    orderNumberIdx: index("order_number_idx").on(table.orderNumber),
  })
);