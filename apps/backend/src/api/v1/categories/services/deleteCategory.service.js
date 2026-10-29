import { and, eq, or, like } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { categories } = schema;

// Service to delete a category and all its sub-categories for a specific merchant, ensuring proper validation and tenant isolation.
export const deleteCategoryService = async (merchantId, categoryId) => {
  const targetRows = await db
    .select({ id: categories.id, path: categories.path, name: categories.name })
    .from(categories)
    .where(
      and(eq(categories.id, categoryId), eq(categories.merchantId, merchantId)),
    )
    .limit(1);

  if (!targetRows[0]) {
    throw new AppError("Category not found in your store.", 404);
  }

  const targetPath = targetRows[0].path;

  // Delete the category itself AND any sub-categories starting with '/parent-path/%'
  const deleted = await db
    .delete(categories)
    .where(
      and(
        eq(categories.merchantId, merchantId),
        or(
          eq(categories.id, categoryId),
          like(categories.path, `${targetPath}/%`),
        ),
      ),
    )
    .returning({ id: categories.id, path: categories.path });

  await invalidateTenantCache(merchantId);

  return {
    deleted_count: deleted.length,
    deleted_paths: deleted.map((d) => d.path),
  };
};