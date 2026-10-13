import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { AppError } from "../../../core/errors/AppError.js";
import { env } from "../../../config/env.js";

// Database Connection Setup
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Admin Login Service
export const adminLoginService = async (email, plainPassword) => {
  const result = await db.execute(
    `SELECT * FROM merchants WHERE email = '${email}' LIMIT 1`,
  );

  if (result.rows.length === 0) {
    throw new AppError("Invalid Credentials.", 401);
  }

  const merchant = result.rows[0];

  const isPasswordMatch = await bcrypt.compare(
    plainPassword,
    merchant.password,
  );

  if (!isPasswordMatch) {
    throw new AppError("Invalid Credentials.", 401);
  }
  return {
    merchant_id: merchant.id,
    store_name: merchant.store_name,
    domain_url: merchant.domain_url,
    status: merchant.status,
  };
};