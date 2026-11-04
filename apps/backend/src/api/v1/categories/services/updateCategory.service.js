import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";
import { buildCategoryPath } from "../../../../utils/slug.util.js";

const { categories } = schema;

// Service to update an existing category for a specific merchant, ensuring proper validation and uniqueness of the category path.
export const updateCategoryService = async (merchantId, categoryId, data) => {
  const existingRows = await db
    .select()
    .from(categories)
    .where(
      and(eq(categories.id, categoryId), eq(categories.merchantId, merchantId)),
    )
    .limit(1);

  const current = existingRows[0];
  if (!current) {
    throw new AppError("Category not found in your store.", 404);
  }

  let parentPath = null;
  if (current.parentId) {
    const parentRows = await db
      .select({ path: categories.path })
      .from(categories)
      .where(
        and(
          eq(categories.id, current.parentId),
          eq(categories.merchantId, merchantId),
        ),
      )
      .limit(1);
    parentPath = parentRows[0]?.path || null;
  }

  const newPath = buildCategoryPath(parentPath, data.slug);

  const [updated] = await db
    .update(categories)
    .set({
      name: data.name,
      slug: data.slug,
      path: newPath,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : current.imageUrl,
      iconUrl: data.iconUrl !== undefined ? data.iconUrl : current.iconUrl,
    })
    .where(
      and(eq(categories.id, categoryId), eq(categories.merchantId, merchantId)),
    )
    .returning();

  await invalidateTenantCache(merchantId);
  return updated;
};