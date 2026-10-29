import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { products } = schema;

// Service to delete a product for a specific merchant, ensuring tenant isolation and cache invalidation
export const deleteProductService = async (merchantId, productId) => {
  const deleted = await db
    .delete(products)
    .where(and(eq(products.id, productId), eq(products.merchantId, merchantId)))
    .returning({ id: products.id, title: products.title, slug: products.slug });

  if (!deleted[0]) {
    throw new AppError("Product not found in your store.", 404);
  }

  await invalidateTenantCache(merchantId);
  return deleted[0];
};