import { eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { merchantPaymentConfigs } = schema;

// Retrieve Store Checkout Options (Bank QR, Card Gateway, Mobile Wallets, COD)
export const getCheckoutOptionsService = async (
  merchantId,
  buyerCountry = "PK",
) => {
  const country = String(buyerCountry || "PK")
    .toUpperCase()
    .trim();

  const config = await getOrSetTenantCache(
    merchantId,
    "payments:checkout_config",
    async () => {
      const rows = await db
        .select()
        .from(merchantPaymentConfigs)
        .where(eq(merchantPaymentConfigs.merchantId, merchantId))
        .limit(1);

      return rows[0] || null;
    },
    3600,
  );

  const isCardActive = Boolean(
    config?.activeGatewayProvider && config?.isProductionKeyVerified,
  );
  const isLocalBuyer = country === "PK";

  return {
    settlement_base_currency: "PKR",
    settlement_notice:
      "All orders are processed in store base currency (PKR) at your bank's live exchange rate.",
    options: [
      {
        option_number: 1,
        category: "instant_bank_qr",
        title: "Instant Bank Transfer / Raast / NayaPay QR",
        badge: "0% Extra Fee — Recommended",
        enabled: config ? config.enableInstantBankQr : true,
        requires_unique_tid: true,
        bank_details: config?.bankQrDetails || {},
      },
      {
        option_number: 2,
        category: "card_gateway",
        title: "Debit / Credit Cards (Visa, Mastercard, PayPak, Amex)",
        provider: isCardActive ? config.activeGatewayProvider : null,
        enabled: isCardActive,
      },
      {
        option_number: 3,
        category: "mobile_wallet",
        title: isLocalBuyer
          ? "Mobile Wallets (EasyPaisa / JazzCash)"
          : "Express Wallets (Apple Pay / Google Pay)",
        provider: isCardActive ? config.activeGatewayProvider : null,
        enabled: isCardActive,
      },
      {
        option_number: 4,
        category: "cod",
        title: "Cash on Delivery (COD)",
        // Automatically hide COD for international buyers
        enabled: isLocalBuyer && (config ? config.enableCod : true),
        require_advance_delivery_fee: config
          ? config.requireAdvanceDeliveryFeeForCod
          : false,
      },
    ],
  };
};