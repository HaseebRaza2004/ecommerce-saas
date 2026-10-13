import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema/index.js"; // 👈 Yahan bhi update kar diya
import "dotenv/config";

const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });
