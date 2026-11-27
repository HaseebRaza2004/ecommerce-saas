import crypto from "crypto";
import { redisClient } from "../../../../config/redis.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { syncDomainCache } from "../../../../core/redis/domainCache.service.js";

const stripSecret = (acc) => {
  const { password, ...safeAccount } = acc;
  return safeAccount;
};

/**
 *  1. Create 120s Single-Use Store Picker Session (Only When Verified User Has >1 Store)
 */
export const createStoreSelectionSession = async (verifiedAccounts) => {
  const selectionToken = crypto.randomBytes(24).toString("hex");
  const safeList = verifiedAccounts.map(stripSecret);

  await redisClient.set(
    `console:pick:${selectionToken}`,
    JSON.stringify(safeList),
    "EX",
    120,
  );

  return {
    requires_store_selection: true,
    selection_token: selectionToken,
    stores: safeList.map((a) => ({
      merchant_id: a.merchant_id,
      store_name: a.store_name,
      domain_url: a.domain_url,
      role: a.role,
    })),
  };
};

/**
 * 2. Finalize Multi-Store Selection & Burn One-Time Token
 */
export const consumeStoreSelectionService = async (
  selectionToken,
  merchantId,
) => {
  if (!selectionToken || !merchantId) {
    throw new AppError("selectionToken and merchantId are required.", 400);
  }

  const key = `console:pick:${selectionToken}`;
  const raw = await redisClient.get(key);
  if (!raw) {
    throw new AppError(
      "Store selection session expired. Please log in again.",
      401,
    );
  }

  const allowedAccounts = JSON.parse(raw);
  const chosen = allowedAccounts.find((a) => a.merchant_id === merchantId);
  if (!chosen) {
    throw new AppError("Unauthorized store selection.", 403);
  }

  await redisClient.del(key);
  syncDomainCache(chosen.domain_url, {
    merchant_id: chosen.merchant_id,
    store_name: chosen.store_name,
    domain_url: chosen.domain_url,
    db_region: chosen.db_region,
    status: chosen.status,
  });

  return chosen;
};