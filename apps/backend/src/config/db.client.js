import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../../../packages/db/schema/index.js";
import "./env.js";

const databaseUrl = process.env.DATABASE_URL;

// Check for the presence of the DATABASE_URL environment variable
if (!databaseUrl) {
  console.error("🚨 CRITICAL: DATABASE_URL environment variable is missing!");
  process.exit(1);
}

//  Centralized Neon Client Instance
export const sql = neon(databaseUrl);
//  Drizzle ORM Instance with Schema
export const db = drizzle(sql, { schema });
//  Exporting the schema for external use (e.g., migrations, type safety)
export { schema };