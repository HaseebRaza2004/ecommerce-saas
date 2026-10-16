import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  index,
} from "drizzle-orm/pg-core";
import { merchants } from "./tenant.js";
import { kycDocTypeEnum, kycStatusEnum } from "./enums.js";

/**
 * 🛡️ MERCHANT KYC SCHEMA: Anti-Fraud & Law Enforcement Traceability
 * Why: Prevents scam stores while keeping business registration optional for small sellers.
 */
export const merchantKyc = pgTable(
  "merchant_kyc",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull()
      .unique(),

    // Individual Identity (Required before store goes live)
    legalFullName: varchar("legal_full_name", { length: 150 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    documentType: kycDocTypeEnum("document_type").notNull().default("cnic"),

    // Security: CNIC/Passport number AES-256 encrypted string ke taur par save hoga
    encryptedIdNumber: varchar("encrypted_id_number", {
      length: 500,
    }).notNull(),

    // Private Cloudflare R2 Bucket URLs (Never publicly accessible)
    documentFrontUrl: varchar("document_front_url", { length: 500 }).notNull(),
    documentBackUrl: varchar("document_back_url", { length: 500 }),
    selfieUrl: varchar("selfie_url", { length: 500 }),

    // Optional Business Details (Chote sellers ke liye NULL reh sakta hai, crash nahi karega)
    registeredBusinessName: varchar("registered_business_name", {
      length: 200,
    }),
    taxRegistrationNumber: varchar("tax_registration_number", { length: 100 }),

    // Cyber Audit Trail
    submissionIp: varchar("submission_ip", { length: 50 }),
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
