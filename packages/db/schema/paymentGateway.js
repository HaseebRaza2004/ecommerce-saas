import {
  pgTable,
  uuid,
  varchar,
  decimal,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";

// PAYMENT GATEWAYS & CARD FEE MANAGEMENT SCHEMA

export const merchantPaymentConfigs = pgTable(
  "merchant_payment_configs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    // 🏦 Option 1: Instant Bank / Raast / NayaPay QR (0% Extra Fee — Recommended)
    enableInstantBankQr: boolean("enable_instant_bank_qr")
      .notNull()
      .default(true),
    bankQrDetails: jsonb("bank_qr_details").notNull().default({
      bankName: "",
      accountTitle: "",
      iban: "",
      raastIdOrPhone: "",
      qrImageUrl: "",
    }),

    // 🔐 Option 2 & 3: BYOK Card & Wallet Gateway (Safepay, AbhiPay, PayFast, Alfalah MPGS, Stripe)
    activeGatewayProvider: varchar("active_gateway_provider", { length: 50 }), // e.g., "safepay", "payfast", "stripe"

    // AES-256-GCM Encrypted Payload: { ciphertext: "...", iv: "...", authTag: "..." }
    encryptedGatewayKeys: jsonb("encrypted_gateway_keys").notNull().default({}),

    // Silent Live Production Credential Check & Auto-Fallback
    isProductionKeyVerified: boolean("is_production_key_verified")
      .notNull()
      .default(false),
    lastKeyCheckAt: timestamp("last_key_check_at"),
    autoFallbackToBankAndCod: boolean("auto_fallback_to_bank_and_cod")
      .notNull()
      .default(true),
    // Refund Protection: Deduct non-refundable gateway fee on buyer's remorse refunds
    deductGatewayFeeOnRefund: boolean("deduct_gateway_fee_on_refund")
      .notNull()
      .default(true),

    // 🚚 Option 4: Cash on Delivery (COD) & Advance Delivery Fee Toggle
    enableCod: boolean("enable_cod").notNull().default(true),
    requireAdvanceDeliveryFeeForCod: boolean(
      "require_advance_delivery_fee_for_cod",
    )
      .notNull()
      .default(false),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    payConfigMerchantIdx: index("pay_config_merchant_idx").on(table.merchantId),
  }),
);
