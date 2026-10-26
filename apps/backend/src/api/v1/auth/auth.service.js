import bcrypt from "bcrypt";
import { neon } from "@neondatabase/serverless";
import { AppError } from "../../../core/errors/AppError.js";
import "../../../../src/config/env.js";

const sql = neon(process.env.DATABASE_URL);

//  MICRO-FUNCTION 1: Fetch Merchant Safely by Email

const findMerchantByEmail = async (email) => {
  const rows = await sql`
    SELECT id, store_name, domain_url, email, password, status
    FROM merchants
    WHERE email = ${email}
    LIMIT 1;
  `;
  return rows[0] || null;
};

//  MICRO-FUNCTION 2: Verify Password & Account Status
 
export const adminLoginService = async (email, plainPassword) => {
  const merchant = await findMerchantByEmail(email);

  // Generic error message so hackers cannot enumerate valid emails
  if (!merchant) {
    throw new AppError("Invalid email or password.", 401);
  }

  const isPasswordValid = await bcrypt.compare(
    plainPassword,
    merchant.password,
  );
  if (!isPasswordValid) {
    throw new AppError("Invalid email or password.", 401);
  }

  // Blueprint Kill Switch Check: Block suspended stores
  if (merchant.status === "suspended") {
    throw new AppError(
      "Your store is currently suspended due to billing or policy violation.",
      403,
    );
  }

  return {
    merchant_id: merchant.id,
    store_name: merchant.store_name,
    domain_url: merchant.domain_url,
    status: merchant.status,
  };
};