import crypto from "crypto";
import bcrypt from "bcrypt";
import { eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { syncDomainCache } from "../../../../core/redis/domainCache.service.js";
import { adminRegisterService } from "../../auth/services/registerAdmin.service.js";
import { resolveConsoleAccountService } from "../../auth/services/resolveConsoleAccount.service.js";
import { createStoreSelectionSession } from "../../auth/services/consoleStoreSelect.service.js";

const { merchants } = schema;

/**
 * 🏢 Unified Console Omni-Auth Resolver (Owner + SaaS Super Admin + Staff — Zero Domain!)
 */
export const resolveMerchantIdentityService = async (data) => {
  const {
    provider,
    email,
    phone,
    password,
    storeName,
    domainUrl,
    merchantId = null,
  } = data;

  const candidates = await resolveConsoleAccountService({
    email,
    phone,
    targetMerchantId: merchantId,
  });

  // 1. Existing Owner / SaaS Super Admin / Active Staff Found
  if (candidates.length > 0) {
    let validAccounts = candidates;

    if (provider === "email_password") {
      validAccounts = [];
      for (const acc of candidates) {
        if (
          acc.password &&
          password &&
          (await bcrypt.compare(password, acc.password))
        ) {
          validAccounts.push(acc);
        }
      }
      if (validAccounts.length === 0) {
        throw new AppError("Invalid email/phone or password.", 401);
      }
    }

    if (validAccounts.length > 1) {
      return await createStoreSelectionSession(validAccounts);
    }

    const { password: _, ...safeAccount } = validAccounts[0];

    // Auto-link missing phone on Owner record if authenticated via WhatsApp/Apple
    if (!safeAccount.staff_id && phone && !safeAccount.phone) {
      await db
        .update(merchants)
        .set({ phone })
        .where(eq(merchants.id, safeAccount.merchant_id));
      safeAccount.phone = phone;
    }

    syncDomainCache(safeAccount.domain_url, {
      merchant_id: safeAccount.merchant_id,
      store_name: safeAccount.store_name,
      domain_url: safeAccount.domain_url,
      db_region: safeAccount.db_region,
      status: safeAccount.status,
    });
    return safeAccount;
  }

  // 2. No Console Access Found -> Allow 1-Click New Store Onboarding ONLY if storeName + domainUrl provided
  if (!storeName || !domainUrl || !email) {
    throw new AppError(
      "Access denied: No Admin Console (Owner or Staff) account found for this email or phone.",
      403,
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