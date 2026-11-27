import bcrypt from "bcrypt";
import { AppError } from "../../../../core/errors/AppError.js";
import { syncDomainCache } from "../../../../core/redis/domainCache.service.js";
import { resolveConsoleAccountService } from "./resolveConsoleAccount.service.js";
import { createStoreSelectionSession } from "./consoleStoreSelect.service.js";

// Precomputed dummy hash to prevent user-enumeration timing attacks
const DUMMY_HASH =
  "$2b$12$C6UzMDM.H6dfI/f/IKxGhu6P6zP5v8Q2N9w7L3X9q8R5T6U7V8W9a";

/**
 * 🔐 Unified Console Password Login (Owner + SaaS Super Admin + Staff — Zero Domain Needed)
 */
export const adminLoginService = async ({
  email,
  phone,
  password,
  merchantId = null,
}) => {
  const candidates = await resolveConsoleAccountService({
    email,
    phone,
    targetMerchantId: merchantId,
  });

  if (candidates.length === 0) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw new AppError("Invalid email/phone or password.", 401);
  }

  const verifiedMatches = [];
  for (const candidate of candidates) {
    if (
      candidate.password &&
      (await bcrypt.compare(password, candidate.password))
    ) {
      verifiedMatches.push(candidate);
    }
  }

  if (verifiedMatches.length === 0) {
    throw new AppError("Invalid email/phone or password.", 401);
  }

  // Edge Case: Staff/User has access to multiple stores with the same credentials
  if (verifiedMatches.length > 1) {
    return await createStoreSelectionSession(verifiedMatches);
  }

  const { password: _, ...safeAccount } = verifiedMatches[0];
  syncDomainCache(safeAccount.domain_url, {
    merchant_id: safeAccount.merchant_id,
    store_name: safeAccount.store_name,
    domain_url: safeAccount.domain_url,
    db_region: safeAccount.db_region,
    status: safeAccount.status,
  });

  return safeAccount;
};