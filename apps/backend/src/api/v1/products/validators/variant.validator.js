import { AppError } from "../../../../core/errors/AppError.js";

const cleanStr = (val, max = 150) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate and normalize product variants input
export const validateVariantsInput = (variants, fallbackBasePrice) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    // Default single variant if merchant didn't specify multiple sizes
    return [
      {
        title: "Default",
        options: { default: true },
        sku: `SKU-${Date.now()}`,
        barcode: null,
        price: fallbackBasePrice,
        compareAtPrice: null,
        regionalPrices: {},
        stockCount: 0,
        weightGrams: 0,
      },
    ];
  }

  if (variants.length > 100) {
    throw new AppError("Maximum 100 variants allowed per product.", 400);
  }

  return variants.map((v, idx) => {
    const title = cleanStr(v.title, 150);
    const sku = cleanStr(v.sku, 100);
    const priceNum = Number(v.price);

    if (!title || !sku) {
      throw new AppError(
        `Variant #${idx + 1} requires both a title (e.g., 'SM', '42') and SKU.`,
        400,
      );
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      throw new AppError(
        `Variant '${title}' must have a valid non-negative price.`,
        400,
      );
    }

    const stockCount = Math.max(0, parseInt(v.stockCount ?? 0, 10) || 0);
    const weightGrams = Math.max(0, parseInt(v.weightGrams ?? 0, 10) || 0);

    return {
      title,
      options:
        v.options && typeof v.options === "object"
          ? v.options
          : { size: title },
      sku,
      barcode: v.barcode ? cleanStr(v.barcode, 100) : null,
      price: priceNum.toFixed(2),
      compareAtPrice: v.compareAtPrice
        ? Number(v.compareAtPrice).toFixed(2)
        : null,
      regionalPrices:
        v.regionalPrices && typeof v.regionalPrices === "object"
          ? v.regionalPrices
          : {},
      stockCount,
      weightGrams,
    };
  });
};