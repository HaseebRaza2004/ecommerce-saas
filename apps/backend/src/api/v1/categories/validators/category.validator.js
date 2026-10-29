import { AppError } from "../../../../core/errors/AppError.js";
import { generateSeoSlug } from "../../../../utils/slug.util.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const cleanText = (str, maxLen = 100) => {
  if (typeof str !== "string") return "";
  return str
    .replace(/[<>'"`;(){}]/g, "")
    .trim()
    .slice(0, maxLen);
};

// Validate the request body for creating a new category, ensuring proper name, slug, and optional parentId.
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

  // Allow custom SEO slug override or auto-generate from name, ensuring it's valid and SEO-friendly.
  const rawSlug = body.slug ? cleanText(body.slug, 150) : name;
  const slug = generateSeoSlug(rawSlug);

  if (!slug || slug.length < 2) {
    throw new AppError(
      "Could not generate a valid URL slug from category name.",
      400,
    );
  }

  let parentId = null;
  if (
    body.parentId !== undefined &&
    body.parentId !== null &&
    body.parentId !== ""
  ) {
    if (typeof body.parentId !== "string" || !UUID_REGEX.test(body.parentId)) {
      throw new AppError("Invalid parent category ID format.", 400);
    }
    parentId = body.parentId;
  }

  return { name, slug, parentId };
};

export const validateCategoryIdParam = (id) => {
  if (!id || typeof id !== "string" || !UUID_REGEX.test(id)) {
    throw new AppError("Invalid category ID parameter.", 400);
  }
  return id;
};