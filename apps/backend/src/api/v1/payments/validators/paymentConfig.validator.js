import { AppError } from "../../../../core/errors/AppError.js";

const SUPPORTED_GATEWAYS = new Set([
  "safepay",
  "payfast",
  "abhipay",
  "alfalah_mpgs",
  "stripe",
  "adyen",
  "paytabs",
]);

const cleanStr = (val, max = 200) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate BYOK Gateway Credentials (Blocks Sandbox/Test Keys in Production)
const verifyLiveGatewayKeys = (keysObj) => {
  if (!keysObj || typeof keysObj !== "object")
    return { isLive: false, sanitized: {} };

  const entries = Object.entries(keysObj);
  if (entries.length === 0) return { isLive: false, sanitized: {} };

  const sanitized = {};
  for (const [k, v] of entries) {
    const valStr = cleanStr(String(v), 500);
    const lowerVal = valStr.toLowerCase();

    if (
      lowerVal.includes("sk_test_") ||
      lowerVal.includes("pk_test_") ||
      lowerVal.includes("sandbox") ||
      lowerVal.startsWith("test_")
    ) {
      throw new AppError(
        `Sandbox/Test key detected in '${k}'. Only live production gateway keys are permitted.`,
        422,
      );
    }
    sanitized[cleanStr(k, 50)] = valStr;
  }

  return { isLive: true, sanitized };
};

export const validatePaymentConfigInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid payment configuration payload.", 400);
  }

  const qr = body.bankQrDetails || {};
  const bankQrDetails = {
    bankName: cleanStr(qr.bankName, 100),
    accountTitle: cleanStr(qr.accountTitle, 150),
    iban: cleanStr(qr.iban, 50).replace(/\s+/g, "").toUpperCase(),
    raastIdOrPhone: cleanStr(qr.raastIdOrPhone, 50),
    qrImageUrl:
      qr.qrImageUrl && String(qr.qrImageUrl).startsWith("https://")
        ? qr.qrImageUrl.trim()
        : "",
  };

  const provider = body.activeGatewayProvider
    ? cleanStr(body.activeGatewayProvider, 50).toLowerCase()
    : null;

  if (provider && !SUPPORTED_GATEWAYS.has(provider)) {
    throw new AppError(`Unsupported gateway provider '${provider}'.`, 400);
  }

  const { isLive, sanitized } = verifyLiveGatewayKeys(body.gatewayKeys);

  return {
    enableInstantBankQr: body.enableInstantBankQr !== false,
    bankQrDetails,
    activeGatewayProvider: provider,
    gatewayKeys: sanitized,
    isProductionKeyVerified: Boolean(provider && isLive),
    autoFallbackToBankAndCod: body.autoFallbackToBankAndCod !== false,
    deductGatewayFeeOnRefund: body.deductGatewayFeeOnRefund !== false,
    enableCod: body.enableCod !== false,
    requireAdvanceDeliveryFeeForCod: Boolean(
      body.requireAdvanceDeliveryFeeForCod,
    ),
  };
};