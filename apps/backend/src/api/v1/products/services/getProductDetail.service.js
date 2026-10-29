import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { products, productVariants, productCategories, categories } = schema;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Service to fetch detailed product information for a specific merchant, including variants and assigned categories, while leveraging caching for performance
export const getProductDetailService = async (merchantId, slugOrId) => {
  const cleanKey = String(slugOrId).toLowerCase().trim();

  return await getOrSetTenantCache(
    merchantId,
    `products:detail:${cleanKey}`,
    async () => {
      const condition = UUID_REGEX.test(cleanKey)
        ? and(eq(products.merchantId, merchantId), eq(products.id, cleanKey))
        : and(eq(products.merchantId, merchantId), eq(products.slug, cleanKey));

      const productRows = await db
        .select()
        .from(products)
        .where(condition)
        .limit(1);
      const product = productRows[0];

      if (!product) {
        throw new AppError("Product not found in this store.", 404);
      }

      // Fetch all size/number variants and assigned categories in parallel
      const [variants, assignedCats] = await Promise.all([
        db
          .select()
          .from(productVariants)
          .where(eq(productVariants.productId, product.id)),
        db
          .select({
            id: categories.id,
            name: categories.name,
            slug: categories.slug,
            path: categories.path,
          })
          .from(productCategories)
          .innerJoin(
            categories,
            eq(productCategories.categoryId, categories.id),
          )
          .where(eq(productCategories.productId, product.id)),
      ]);

      return {
        ...product,
        categories: assignedCats,
        variants,
      };
    },
    3600,
  );
};