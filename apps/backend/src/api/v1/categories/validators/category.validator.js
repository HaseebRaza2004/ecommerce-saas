import { AppError } from "../../../../core/errors/AppError.js";
import { generateSeoSlug } from "../../../../utils/slug.util.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanText = (str, maxLen = 100) =>
  typeof str === "string"
    ? str
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, maxLen)
    : "";

const cleanHttpsUrl = (url) => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith("https://") || trimmed.length > 500) {
    throw new AppError(
      "Category imageUrl and iconUrl must be valid HTTPS URLs.",
      400,
    );
  }
  return trimmed;
};

export const validateCreateCategory = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid category request payload.", 400);
  }

  const name = cleanText(body.name, 100);
  if (name.length < 2) {
    throw new AppError(
      "Category name must be between 2 and 100 characters.",
      400,
    );
  }

  const slug = generateSeoSlug(body.slug ? cleanText(body.slug, 150) : name);
  if (!slug || slug.length < 2) {
    throw new AppError("Could not generate a valid URL slug.", 400);
  }

  let parentId = null;
  if (body.parentId) {
    if (typeof body.parentId !== "string" || !UUID_REGEX.test(body.parentId)) {
      throw new AppError("Invalid parent category ID format.", 400);
    }
    parentId = body.parentId;
  }

  return {
    name,
    slug,
    parentId,
    imageUrl: cleanHttpsUrl(body.imageUrl),
    iconUrl: cleanHttpsUrl(body.iconUrl),
  };
};

export const validateCategoryIdParam = (id) => {
  if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
    throw new AppError("Invalid category ID parameter.", 400);
  }
  return id;
};