import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";
import { buildCategoryPath } from "../../../../utils/slug.util.js";

const { categories } = schema;

// Service to create a new category (main or sub-category) for a specific merchant, ensuring proper validation and uniqueness of the category path.
export const createCategoryService = async (
  merchantId,
  { name, slug, parentId },
) => {
  let parentPath = null;

  // 1. If Sub-Category, verify Parent exists AND belongs to this exact Merchant (IDOR Shield)
  if (parentId) {
    const parentRows = await db
      .select({ id: categories.id, path: categories.path })
      .from(categories)
      .where(
        and(eq(categories.id, parentId), eq(categories.merchantId, merchantId)),
      )
      .limit(1);

    if (!parentRows[0]) {
      throw new AppError("Parent category not found in your store.", 404);
    }
    parentPath = parentRows[0].path;
  }

  const fullPath = buildCategoryPath(parentPath, slug);

  // 2. Prevent duplicate category paths within the same store
  const existing = await db
    .select({ id: categories.id })
    .from(categories)
    .where(
      and(eq(categories.merchantId, merchantId), eq(categories.path, fullPath)),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new AppError(
      `Category with path '${fullPath}' already exists in your store.`,
      409,
    );
  }

  // 3. Insert category and bump O(1) tenant cache version
  const inserted = await db
    .insert(categories)
    .values({
      merchantId,
      name,
      slug,
      parentId,
      path: fullPath,
    })
    .returning();

  await invalidateTenantCache(merchantId);
  return inserted[0];
};