import { db, schema } from "../../../../config/db.client.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";
import { encryptJsonVault } from "../../../../utils/crypto.util.js";

const { merchantCouriers } = schema;

// Encrypt Courier API Credentials (AES-256-GCM) & Save Factory Pickup Config
export const createCourierService = async (merchantId, data) => {
  const hasSecrets = Object.keys(data.apiCredentials).length > 0;
  const encryptedCreds = hasSecrets
    ? encryptJsonVault(data.apiCredentials)
    : {};

  const [created] = await db
    .insert(merchantCouriers)
    .values({
      merchantId,
      providerCode: data.providerCode,
      displayName: data.displayName,
      apiCredentials: encryptedCreds,
      pickupAddress: data.pickupAddress,
      autoTriggerPickup: data.autoTriggerPickup,
      isActive: data.isActive,
    })
    .returning({
      id: merchantCouriers.id,
      providerCode: merchantCouriers.providerCode,
      displayName: merchantCouriers.displayName,
      pickupAddress: merchantCouriers.pickupAddress,
      autoTriggerPickup: merchantCouriers.autoTriggerPickup,
      isActive: merchantCouriers.isActive,
      createdAt: merchantCouriers.createdAt,
    });

  await invalidateTenantCache(merchantId);

  return {
    ...created,
    has_encrypted_credentials: hasSecrets,
  };
};