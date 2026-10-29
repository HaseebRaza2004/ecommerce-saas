import { AppError } from "../../../../core/errors/AppError.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_PROMO_TYPES = new Set([
  "store_wide_sale",
  "selected_products",
  "promo_code",
]);
const VALID_DISCOUNT_TYPES = new Set(["fixed_amount", "percentage"]);

// Validates the payload for creating a promotion.
export const validateCreatePromotion = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid promotion payload.", 400);
  }

  const type = VALID_PROMO_TYPES.has(body.type) ? body.type : "promo_code";
  const discountType = VALID_DISCOUNT_TYPES.has(body.discountType)
    ? body.discountType
    : null;

  if (!discountType) {
    throw new AppError(
      "discountType must be 'fixed_amount' or 'percentage'.",
      400,
    );
  }

  const discountValueNum = Number(body.discountValue);
  if (Number.isNaN(discountValueNum) || discountValueNum <= 0) {
    throw new AppError("discountValue must be greater than 0.", 400);
  }
  if (discountType === "percentage" && discountValueNum > 100) {
    throw new AppError("Percentage discount cannot exceed 100%.", 400);
  }

  let code = null;
  if (type === "promo_code" || body.code) {
    code = String(body.code || "")
      .toUpperCase()
      .replace(/[^A-Z0-9_-]/g, "")
      .trim();
    if (code.length < 3 || code.length > 50) {
      throw new AppError(
        "Promo code must be 3 to 50 alphanumeric characters.",
        400,
      );
    }
  }

  const targetIds = Array.isArray(body.targetIds)
    ? [
        ...new Set(
          body.targetIds.filter(
            (id) => typeof id === "string" && UUID_REGEX.test(id),
          ),
        ),
      ]
    : [];

  const usageLimit = body.usageLimit
    ? Math.max(1, parseInt(body.usageLimit, 10))
    : null;
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null;
  if (expiresAt && Number.isNaN(expiresAt.getTime())) {
    throw new AppError("Invalid expiresAt timestamp.", 400);
  }

  return {
    type,
    code,
    discountValue: discountValueNum.toFixed(2),
    discountType,
    targetIds,
    usageLimit,
    canStack: Boolean(body.canStack),
    expiresAt,
  };
};