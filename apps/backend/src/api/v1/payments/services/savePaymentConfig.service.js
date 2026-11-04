import { db, schema } from "../../../../config/db.client.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";
import { encryptJsonVault } from "../../../../utils/crypto.util.js";

const { merchantPaymentConfigs } = schema;

export const savePaymentConfigService = async (merchantId, data) => {
  const hasGatewayKeys = Object.keys(data.gatewayKeys).length > 0;
  const hasWalletKeys = Object.keys(data.walletCredentials || {}).length > 0;

  const record = {
    merchantId,
    enableInstantBankQr: data.enableInstantBankQr,
    bankQrDetails: data.bankQrDetails,
    activeGatewayProvider: data.activeGatewayProvider,
    encryptedGatewayKeys: hasGatewayKeys
      ? encryptJsonVault(data.gatewayKeys)
      : {},
    isProductionKeyVerified: data.isProductionKeyVerified,
    lastKeyCheckAt: data.isProductionKeyVerified ? new Date() : null,
    enabledWallets: data.enabledWallets || [],
    encryptedWalletsVault: hasWalletKeys
      ? encryptJsonVault(data.walletCredentials)
      : {},
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
    enabled_wallets: saved.enabledWallets,
    enable_cod: saved.enableCod,
    updated_at: saved.updatedAt,
  };
};