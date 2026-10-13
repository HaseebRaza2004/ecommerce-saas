import {
  pgTable,
  uuid,
  varchar,
  jsonb,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

export const merchants = pgTable(
  "merchants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeName: varchar("store_name", { length: 150 }).notNull(),
    domainUrl: varchar("domain_url", { length: 255 }).unique(),
    dbRegion: varchar("db_region", { length: 20 }).default("asia"),
    email: varchar("email", { length: 255 }).notNull().unique(),
    password: varchar("password", { length: 255 }).notNull(),
    themeConfig: jsonb("theme_config").notNull().default({}),
    uiComponents: jsonb("ui_components").notNull().default({}),
    geoSettings: jsonb("geo_settings").notNull().default({}),
    localization: jsonb("localization").notNull().default({}),
    status: varchar("status", { length: 20 }).default("active"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      // ⚡ VVIP Speed Hack: Domain lookup ke liye Index
      domainIdx: index("domain_idx").on(table.domainUrl),
    };
  },
);