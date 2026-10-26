import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { customers } from "./customer.js";
import { merchantCouriers } from "./courier.js";
import {
  orderSourceEnum,
  orderStatusEnum,
  paymentStatusEnum,
  checkoutPaymentCategoryEnum,
  deliveryVerificationTypeEnum,
} from "./enums.js";

/**
 * 🛒 ORDERS SCHEMA (With Anti-Fraud TID Lock, Fee Pass-Through, Zero-FX Loss & Delivery Handshake)
 */
export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    customerId: uuid("customer_id").references(() => customers.id),
    orderNumber: varchar("order_number", { length: 50 }).notNull(),
    idempotencyKey: varchar("idempotency_key", { length: 100 }).unique(),

    source: orderSourceEnum("source").notNull().default("web_storefront"),
    orderStatus: orderStatusEnum("order_status")
      .notNull()
      .default("pending_verification"),
    paymentStatus: paymentStatusEnum("payment_status")
      .notNull()
      .default("pending"),

    // 4-Option Checkout Tracking
    paymentCategory: checkoutPaymentCategoryEnum("payment_category")
      .notNull()
      .default("cod"),
    paymentMethod: varchar("payment_method", { length: 50 }).notNull(), // Raast_QR, Safepay_Card, EasyPaisa, COD

    // 🔒 Pillar 3: Anti-Fake Bank Transfer Protection (Strict UNIQUE Constraint on TID)
    bankTransactionId: varchar("bank_transaction_id", { length: 100 }).unique(),
    gatewayTransactionId: varchar("gateway_transaction_id", { length: 150 }),

    // 🌍 Pillar 4: Zero FX Loss Multi-Currency Settlement (Charged in Base Currency)
    baseCurrency: varchar("base_currency", { length: 10 })
      .notNull()
      .default("PKR"), // Gateway settles in this
    displayCurrency: varchar("display_currency", { length: 10 })
      .notNull()
      .default("PKR"), // Buyer saw this
    displayExchangeRate: decimal("display_exchange_rate", {
      precision: 12,
      scale: 4,
    })
      .notNull()
      .default("1.0000"),

    // 💰 Financials & Pillar 3 Card Processing Fee Line-Item
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    discountTotal: decimal("discount_total", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    shippingTotal: decimal("shipping_total", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    advanceCodPaid: decimal("advance_cod_paid", { precision: 10, scale: 2 })
      .notNull()
      .default("0.00"),
    grandTotal: decimal("grand_total", { precision: 10, scale: 2 }).notNull(), // Settled in baseCurrency
    refundedFeeDeducted: decimal("refunded_fee_deducted", {
      precision: 10,
      scale: 2,
    }).default("0.00"),

    // 📍 Delivery & Contact Details
    customerPhone: varchar("customer_phone", { length: 50 }).notNull(),
    customerAltPhone: varchar("customer_alt_phone", { length: 50 }),
    shippingCountry: varchar("shipping_country", { length: 100 }).notNull(),
    shippingCity: varchar("shipping_city", { length: 100 }).notNull(),
    shippingPostalCode: varchar("shipping_postal_code", { length: 30 }),
    nearestLandmark: varchar("nearest_landmark", { length: 255 }),
    shippingAddressFull: text("shipping_address_full").notNull(),
    shippingCoordinates: jsonb("shipping_coordinates").default({}),

    // 🚚 Logistics & Pillar 2 Anti-Scam Delivery Handshake Lock
    courierId: uuid("courier_id").references(() => merchantCouriers.id),
    trackingNumber: varchar("tracking_number", { length: 150 }),
    shippingLabelUrl: varchar("shipping_label_url", { length: 500 }),
    scheduledPickupDate: timestamp("scheduled_pickup_date"),

    // Prepaid orders CANNOT be manually marked Delivered without Webhook or Customer QR/6-Digit PIN
    isPrepaidDeliveryLocked: boolean("is_prepaid_delivery_locked")
      .notNull()
      .default(false),
    deliveryVerificationType: deliveryVerificationTypeEnum(
      "delivery_verification_type",
    )
      .notNull()
      .default("unverified"),
    deliverySecretPinHash: varchar("delivery_secret_pin_hash", { length: 255 }), // Hashed 6-digit customer PIN
    deliveryQrToken: varchar("delivery_qr_token", { length: 255 }).unique(), // Unique QR token for Rider scan
    deliveryVerifiedAt: timestamp("delivery_verified_at"),

    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderMerchantIdx: index("order_merchant_idx").on(table.merchantId),
    orderCustomerIdx: index("order_customer_idx").on(table.customerId),
    orderNumberIdx: index("order_number_idx").on(table.orderNumber),
    orderTidIdx: index("order_tid_idx").on(table.bankTransactionId),
  }),
);
