import { AppError } from "../../../../core/errors/AppError.js";

const cleanStr = (val, max = 150) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate and clean the variants input for a product
export const validateVariantsInput = (variants, fallbackBasePrice) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [
      {
        title: "Default",
        options: { default: true },
        imageUrl: null,
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
    throw new AppError(
      "Maximum 100 Size/Color variant combinations allowed per product.",
      400,
    );
  }

  return variants.map((v, idx) => {
    const size = cleanStr(v.size || v.options?.size, 50);
    const color = cleanStr(v.color || v.options?.color, 50);
    const colorHex = cleanStr(v.colorHex || v.options?.colorHex, 20);

    const autoTitle = [size, color].filter(Boolean).join(" / ");
    const title = cleanStr(v.title, 150) || autoTitle;
    const sku = cleanStr(v.sku, 100);
    const priceNum = Number(v.price);

    if (!title || !sku) {
      throw new AppError(
        `Variant #${idx + 1} requires a title (or size/color) and SKU.`,
        400,
      );
    }
    if (Number.isNaN(priceNum) || priceNum < 0) {
      throw new AppError(
        `Variant '${title}' must have a valid non-negative price.`,
        400,
      );
    }

    const options = {
      ...(v.options && typeof v.options === "object" ? v.options : {}),
      ...(size ? { size } : {}),
      ...(color ? { color } : {}),
      ...(colorHex ? { colorHex } : {}),
    };

    const imageUrl =
      typeof v.imageUrl === "string" && v.imageUrl.startsWith("https://")
        ? v.imageUrl.trim()
        : null;

    return {
      title,
      options,
      imageUrl,
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
      stockCount: Math.max(0, parseInt(v.stockCount ?? 0, 10) || 0),
      weightGrams: Math.max(0, parseInt(v.weightGrams ?? 0, 10) || 0),
    };
  });
};