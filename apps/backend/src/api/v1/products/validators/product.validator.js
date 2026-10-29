import { AppError } from "../../../../core/errors/AppError.js";
import { generateSeoSlug } from "../../../../utils/slug.util.js";
import { validateVariantsInput } from "./variant.validator.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanStr = (val, max = 255) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate and normalize product creation input
export const validateCreateProduct = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid product payload.", 400);
  }

  const title = cleanStr(body.title, 255);
  if (title.length < 2) {
    throw new AppError(
      "Product title must be between 2 and 255 characters.",
      400,
    );
  }

  const slug = generateSeoSlug(body.slug ? cleanStr(body.slug, 255) : title);
  const basePriceNum = Number(body.basePrice);
  if (Number.isNaN(basePriceNum) || basePriceNum < 0) {
    throw new AppError("Valid basePrice is required.", 400);
  }

  const images = Array.isArray(body.images)
    ? body.images
        .filter((url) => typeof url === "string" && url.startsWith("https://"))
        .slice(0, 10)
    : [];

  const categoryIds = Array.isArray(body.categoryIds)
    ? [
        ...new Set(
          body.categoryIds.filter(
            (id) => typeof id === "string" && UUID_REGEX.test(id),
          ),
        ),
      ]
    : [];

  const basePrice = basePriceNum.toFixed(2);
  const variants = validateVariantsInput(body.variants, basePrice);
  const totalStock = variants.reduce((sum, v) => sum + v.stockCount, 0);

  return {
    title,
    slug,
    description:
      typeof body.description === "string"
        ? body.description.trim().slice(0, 10000)
        : null,
    images,
    basePrice,
    compareAtPrice: body.compareAtPrice
      ? Number(body.compareAtPrice).toFixed(2)
      : null,
    regionalPrices:
      body.regionalPrices && typeof body.regionalPrices === "object"
        ? body.regionalPrices
        : {},
    trackInventory: body.trackInventory !== false,
    stockCount:
      body.stockCount !== undefined
        ? Math.max(0, parseInt(body.stockCount, 10) || 0)
        : totalStock,
    productType: body.productType === "digital" ? "digital" : "physical",
    weightGrams: Math.max(0, parseInt(body.weightGrams ?? 0, 10) || 0),
    dimensions:
      body.dimensions && typeof body.dimensions === "object"
        ? body.dimensions
        : { length: 0, width: 0, height: 0 },
    variantsMatrix:
      body.variantsMatrix && typeof body.variantsMatrix === "object"
        ? body.variantsMatrix
        : {},
    status: ["active", "draft", "archived"].includes(body.status)
      ? body.status
      : "active",
    categoryIds,
    variants,
  };
};