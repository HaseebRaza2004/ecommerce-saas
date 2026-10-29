import { and, eq, desc, inArray } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { products, productCategories } = schema;

// Service to fetch products for a specific merchant, with optional category filtering and pagination, while leveraging caching for performance
export const getProductsService = async (merchantId, query = {}) => {
  const categoryId = query.categoryId || "all";
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 20));
  const offset = (page - 1) * limit;

  const cacheKey = `products:list:cat_${categoryId}:p_${page}:l_${limit}`;

  return await getOrSetTenantCache(
    merchantId,
    cacheKey,
    async () => {
      if (categoryId !== "all") {
        const linked = await db
          .select({ productId: productCategories.productId })
          .from(productCategories)
          .where(eq(productCategories.categoryId, categoryId));

        const productIds = linked.map((r) => r.productId);
        if (productIds.length === 0) {
          return { page, limit, count: 0, items: [] };
        }

        const items = await db
          .select()
          .from(products)
          .where(
            and(
              eq(products.merchantId, merchantId),
              inArray(products.id, productIds),
            ),
          )
          .orderBy(desc(products.createdAt))
          .limit(limit)
          .offset(offset);

        return { page, limit, count: items.length, items };
      }

      const items = await db
        .select()
        .from(products)
        .where(eq(products.merchantId, merchantId))
        .orderBy(desc(products.createdAt))
        .limit(limit)
        .offset(offset);

      return { page, limit, count: items.length, items };
    },
    3600,
  );
};