import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { syncDomainCache } from "../../../../core/redis/domainCache.service.js";

const { merchants } = schema;

// Admin Login Service: Validate Credentials and Sync Domain Cache
export const adminLoginService = async (email, plainPassword) => {
  const rows = await db
    .select()
    .from(merchants)
    .where(eq(merchants.email, email))
    .limit(1);

  const merchant = rows[0];
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

  if (merchant.status === "suspended") {
    throw new AppError("Your store is currently suspended.", 403);
  }

  const tenantPayload = {
    merchant_id: merchant.id,
    store_name: merchant.storeName,
    domain_url: merchant.domainUrl,
    db_region: merchant.dbRegion,
    status: merchant.status,
  };

  syncDomainCache(merchant.domainUrl, tenantPayload);
  return tenantPayload;
};