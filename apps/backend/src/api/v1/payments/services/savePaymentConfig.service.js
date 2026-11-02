import { db, schema } from "../../../../config/db.client.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";
import { encryptJsonVault } from "../../../../utils/crypto.util.js";

const { merchantPaymentConfigs } = schema;

// Encrypt BYOK Payment Keys (AES-256-GCM) & Upsert Store Payment Settings
export const savePaymentConfigService = async (merchantId, data) => {
  const hasGatewayKeys = Object.keys(data.gatewayKeys).length > 0;
  const encryptedGatewayKeys = hasGatewayKeys
    ? encryptJsonVault(data.gatewayKeys)
    : {};

  const record = {
    merchantId,
    enableInstantBankQr: data.enableInstantBankQr,
    bankQrDetails: data.bankQrDetails,
    activeGatewayProvider: data.activeGatewayProvider,
    encryptedGatewayKeys,
    isProductionKeyVerified: data.isProductionKeyVerified,
    lastKeyCheckAt: data.isProductionKeyVerified ? new Date() : null,
    autoFallbackToBankAndCod: data.autoFallbackToBankAndCod,
    deductGatewayFeeOnRefund: data.deductGatewayFeeOnRefund,
    enableCod: data.enableCod,
    requireAdvanceDeliveryFeeForCod: data.requireAdvanceDeliveryFeeForCod,
    updatedAt: new Date(),
  };

  const [saved] = await db
    .insert(merchantPaymentConfigs)
    .values(record)
    .onConflictDoUpdate({
      target: merchantPaymentConfigs.merchantId,
      set: record,
    })
    .returning();

  await invalidateTenantCache(merchantId);

  return {
    merchant_id: saved.merchantId,
    enable_instant_bank_qr: saved.enableInstantBankQr,
    bank_qr_details: saved.bankQrDetails,
    active_gateway_provider: saved.activeGatewayProvider,
    is_production_key_verified: saved.isProductionKeyVerified,
    auto_fallback_to_bank_and_cod: saved.autoFallbackToBankAndCod,
    deduct_gateway_fee_on_refund: saved.deductGatewayFeeOnRefund,
    enable_cod: saved.enableCod,
    require_advance_delivery_fee_for_cod: saved.requireAdvanceDeliveryFeeForCod,
    updated_at: saved.updatedAt,
  };
};