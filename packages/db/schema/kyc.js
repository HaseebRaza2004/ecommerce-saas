import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { kycDocTypeEnum, kycStatusEnum } from "./enums.js";


// MERCHANT KYC & ANTI-DEEPFAKE SCHEMA
 
export const merchantKyc = pgTable(
  "merchant_kyc",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull()
      .unique(),
    cnicExactName: varchar("cnic_exact_name", { length: 150 }).notNull(), // Full Name (Exact as on CNIC)
    bankAccountTitle: varchar("bank_account_title", { length: 150 }).notNull(), // Bank / Wallet Account Title
    bankName: varchar("bank_name", { length: 100 }).notNull(), // e.g., Meezan Bank, NayaPay, Sadapay
    encryptedIbanOrAccount: varchar("encrypted_iban_or_account", {
      length: 500,
    }).notNull(), // AES-256-GCM Encrypted

    // Token-Based Name Normalizer Output (Strips Muhammad, Syed, M., etc.)
    normalizedNameTokens: jsonb("normalized_name_tokens").notNull().default({
      cnicTokens: [],
      bankTokens: [],
      overlapPassed: false,
    }),
    isNameReconciled: boolean("is_name_reconciled").notNull().default(false),

    // Identity Document Details
    country: varchar("country", { length: 100 }).notNull().default("PK"),
    documentType: kycDocTypeEnum("document_type").notNull().default("cnic"),
    encryptedIdNumber: varchar("encrypted_id_number", {
      length: 500,
    }).notNull(), // AES-256-GCM Encrypted CNIC

    spokenChallengeCode: varchar("spoken_challenge_code", {
      length: 10,
    }).notNull(), // Random 4-digit code shown on screen
    colorFlashVideoUrl: varchar("color_flash_video_url", {
      length: 500,
    }).notNull(), // 3-sec live video in Private R2
    documentFrontUrl: varchar("document_front_url", { length: 500 }).notNull(), // Live camera frame only (no gallery)
    documentBackUrl: varchar("document_back_url", { length: 500 }).notNull(),

    // Hardware Camera Validation & Cross-Device QR Sync Audit
    cameraHardwareMeta: jsonb("camera_hardware_meta").notNull().default({
      deviceLabel: "",
      usbVendorId: "",
      isVirtualCamBlocked: true,
      capturedViaMobileQrSync: false,
    }),
    deviceFingerprint: varchar("device_fingerprint", { length: 255 }).notNull(),
    submissionIp: varchar("submission_ip", { length: 50 }).notNull(),

    // Optional Business Info (Null-safe for home-based sellers)
    registeredBusinessName: varchar("registered_business_name", {
      length: 200,
    }),
    taxRegistrationNumber: varchar("tax_registration_number", { length: 100 }),

    status: kycStatusEnum("status").notNull().default("unsubmitted"),
    rejectionReason: text("rejection_reason"),
    verifiedAt: timestamp("verified_at"),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    kycMerchantIdx: index("kyc_merchant_idx").on(table.merchantId),
    kycStatusIdx: index("kyc_status_idx").on(table.status),
  }),
);