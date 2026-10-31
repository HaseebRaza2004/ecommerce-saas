import { AppError } from "../../../../core/errors/AppError.js";
import { validateCartQuoteInput } from "../../cart/validators/cartQuote.validator.js";

const VALID_PAY_CATEGORIES = new Set([
  "instant_bank_qr",
  "card_gateway",
  "mobile_wallet",
  "cod",
]);
const cleanStr = (val, max = 200) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate Checkout & Order Placement Payload
export const validatePlaceOrderInput = (body) => {
  const { items, promoCode } = validateCartQuoteInput(body);

  const idempotencyKey = cleanStr(body.idempotencyKey, 100);
  if (!idempotencyKey || idempotencyKey.length < 8) {
    throw new AppError(
      "A valid idempotencyKey (min 8 chars) is required to prevent double charges.",
      400,
    );
  }

  const paymentCategory = VALID_PAY_CATEGORIES.has(body.paymentCategory)
    ? body.paymentCategory
    : null;
  const paymentMethod = cleanStr(body.paymentMethod, 50);
  if (!paymentCategory || !paymentMethod) {
    throw new AppError(
      "Valid paymentCategory and paymentMethod are required.",
      400,
    );
  }

// Require Bank Transaction ID for Instant Bank Transfers
  const bankTransactionId = body.bankTransactionId
    ? cleanStr(body.bankTransactionId, 100).toUpperCase()
    : null;
  if (
    paymentCategory === "instant_bank_qr" &&
    (!bankTransactionId || bankTransactionId.length < 5)
  ) {
    throw new AppError(
      "Bank/Raast Transaction ID (TID) is required for instant bank transfers.",
      400,
    );
  }

  const addr = body.shippingAddress || {};
  const country = cleanStr(addr.country, 10).toUpperCase();
  const city = cleanStr(addr.city, 100);
  const streetAddress = cleanStr(addr.streetAddress, 500);
  const phone = cleanStr(body.customerPhone || addr.phone, 50);

  if (!country || !city || !streetAddress || !phone) {
    throw new AppError(
      "Shipping country, city, streetAddress, and customerPhone are required.",
      400,
    );
  }

// Restrict Cash on Delivery (COD) to Local Orders Only
  if (country !== "PK" && paymentCategory === "cod") {
    throw new AppError(
      "Cash on Delivery (COD) is only available for local orders. Please use a prepaid method.",
      422,
    );
  }

  return {
    idempotencyKey,
    items,
    promoCode,
    paymentCategory,
    paymentMethod,
    bankTransactionId,
    customerName: cleanStr(body.customerName, 150) || "Guest Buyer",
    customerEmail: body.customerEmail
      ? cleanStr(body.customerEmail, 255).toLowerCase()
      : null,
    customerPhone: phone,
    customerAltPhone: body.customerAltPhone
      ? cleanStr(body.customerAltPhone, 50)
      : null,
    shippingCountry: country,
    shippingCity: city,
    shippingPostalCode: cleanStr(addr.postalCode, 30) || null,
    nearestLandmark: cleanStr(addr.nearestLandmark, 255) || null,
    shippingAddressFull: streetAddress,
    shippingCoordinates:
      addr.coordinates && typeof addr.coordinates === "object"
        ? addr.coordinates
        : {},
    displayCurrency: cleanStr(body.displayCurrency || "PKR", 10).toUpperCase(),
    displayExchangeRate: Math.max(
      0.0001,
      Number(body.displayExchangeRate) || 1,
    ).toFixed(4),
    notes: body.notes ? cleanStr(body.notes, 500) : null,
  };
};