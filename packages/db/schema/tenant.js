import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
  boolean,
} from "drizzle-orm/pg-core";
import { storeStatusEnum } from "./enums.js";

// TENANT SCHEMA: Master Merchant & Store Isolation

export const merchants = pgTable(
  "merchants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeName: varchar("store_name", { length: 150 }).notNull(),
    domainUrl: varchar("domain_url", { length: 255 }).unique(),
    dbRegion: varchar("db_region", { length: 20 }).default("asia"),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }),
    themeConfig: jsonb("theme_config").notNull().default({}),
    uiComponents: jsonb("ui_components").notNull().default({}),
    geoSettings: jsonb("geo_settings").notNull().default({}),
    localization: jsonb("localization").notNull().default({}),
    analyticsPixels: jsonb("analytics_pixels").notNull().default({}),
    status: storeStatusEnum("status").notNull().default("active"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      domainIdx: index("domain_idx").on(table.domainUrl),
    };
  },
);

// TENANT DOMAINS SCHEMA: Supports Multi-Domain & SSL Verification for Each Tenant
export const tenantDomains = pgTable(
  "tenant_domains",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .references(() => merchants.id, { onDelete: "cascade" })
      .notNull(),
    domain: varchar("domain", { length: 255 }).notNull().unique(),
    isPrimary: boolean("is_primary").notNull().default(false),
    sslVerified: boolean("ssl_verified").notNull().default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tenantDomainMerchantIdx: index("tenant_domain_merchant_idx").on(
      table.merchantId,
    ),
  }),
);