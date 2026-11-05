import crypto from "crypto";
import bcrypt from "bcrypt";
import { eq, or } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { syncDomainCache } from "../../../../core/redis/domainCache.service.js";
import { adminRegisterService } from "../../auth/services/registerAdmin.service.js";

const { merchants } = schema;

// Resolve Merchant Identity Across Multiple OmniAuth Providers (Google, Apple, WhatsApp, Email/Password)
export const resolveMerchantIdentityService = async (data) => {
  const { provider, email, phone, password, storeName, domainUrl } = data;

  const conditions = [];
  if (email) conditions.push(eq(merchants.email, email));
  if (phone) conditions.push(eq(merchants.phone, phone));

  const rows = await db
    .select()
    .from(merchants)
    .where(or(...conditions))
    .limit(1);

  const merchant = rows[0];

  // 1. Existing Merchant Found -> Link any missing email/phone & Login to the SAME Store
  if (merchant) {
    if (merchant.status === "suspended") {
      throw new AppError("Your store is currently suspended.", 403);
    }

    if (provider === "email_password") {
      if (!password || !(await bcrypt.compare(password, merchant.password))) {
        throw new AppError("Invalid merchant email/phone or password.", 401);
      }
    }

    if ((phone && !merchant.phone) || (email && merchant.email !== email)) {
      await db
        .update(merchants)
        .set({ phone: phone || merchant.phone })
        .where(eq(merchants.id, merchant.id));
    }

    const payload = {
      merchant_id: merchant.id,
      store_name: merchant.storeName,
      domain_url: merchant.domainUrl,
      db_region: merchant.dbRegion,
      status: merchant.status,
    };
    syncDomainCache(merchant.domainUrl, payload);
    return payload;
  }

  // 2. If Merchant doesn't exist yet -> Require storeName & domainUrl for 1-click OAuth Onboarding
  if (!storeName || !domainUrl || !email) {
    throw new AppError(
      "No store found for this account. Please provide storeName, domainUrl, and email to register.",
      404,
    );
  }

  const autoPassword = password || crypto.randomBytes(24).toString("hex");
  return await adminRegisterService({
    storeName,
    domainUrl,
    email,
    password: autoPassword,
    phone,
  });
};