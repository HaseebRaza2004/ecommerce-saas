import { AppError } from "../../../../core/errors/AppError.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Validate Cart Quote Input (Items & Promo Code)
export const validateCartQuoteInput = (body) => {
  if (
    !body ||
    typeof body !== "object" ||
    !Array.isArray(body.items) ||
    body.items.length === 0
  ) {
    throw new AppError("Cart must contain at least one item.", 400);
  }

  if (body.items.length > 50) {
    throw new AppError("Cart cannot exceed 50 distinct line items.", 400);
  }

  // Merge duplicate variantIds in payload so attackers can't bypass stock checks
  const mergedMap = new Map();

  for (const rawItem of body.items) {
    const variantId = rawItem?.variantId;
    const qty = parseInt(rawItem?.quantity, 10);

    if (
      !variantId ||
      typeof variantId !== "string" ||
      !UUID_REGEX.test(variantId)
    ) {
      throw new AppError(
        "Each cart item requires a valid variantId UUID.",
        400,
      );
    }
    if (Number.isNaN(qty) || qty < 1 || qty > 999) {
      throw new AppError("Item quantity must be between 1 and 999.", 400);
    }

    mergedMap.set(variantId, (mergedMap.get(variantId) || 0) + qty);
  }

  const items = Array.from(mergedMap.entries()).map(
    ([variantId, quantity]) => ({
      variantId,
      quantity,
    }),
  );

  const promoCode =
    body.promoCode && typeof body.promoCode === "string"
      ? body.promoCode
          .replace(/[<>'"`;(){}]/g, "")
          .trim()
          .slice(0, 50)
      : null;

  return { items, promoCode };
};