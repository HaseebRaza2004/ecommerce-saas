import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { products, productCategories, productVariants, categories } = schema;

// Service to create a new product for a specific merchant, ensuring data integrity and tenant isolation
export const createProductService = async (merchantId, data) => {
  // 1. Check duplicate slug within the same store
  const existingSlug = await db
    .select({ id: products.id })
    .from(products)
    .where(
      and(eq(products.merchantId, merchantId), eq(products.slug, data.slug)),
    )
    .limit(1);

  if (existingSlug.length > 0) {
    throw new AppError(
      `A product with slug '${data.slug}' already exists in your store.`,
      409,
    );
  }

  // 2. Verify all provided categoryIds belong to this Merchant (IDOR Shield)
  if (data.categoryIds.length > 0) {
    const validCats = await db
      .select({ id: categories.id })
      .from(categories)
      .where(
        and(
          eq(categories.merchantId, merchantId),
          inArray(categories.id, data.categoryIds),
        ),
      );

    if (validCats.length !== data.categoryIds.length) {
      throw new AppError(
        "One or more category IDs do not belong to your store.",
        403,
      );
    }
  }

  // 3. Insert Core Product
  const [createdProduct] = await db
    .insert(products)
    .values({
      merchantId,
      slug: data.slug,
      title: data.title,
      description: data.description,
      images: data.images,
      basePrice: data.basePrice,
      compareAtPrice: data.compareAtPrice,
      regionalPrices: data.regionalPrices,
      trackInventory: data.trackInventory,
      stockCount: data.stockCount,
      productType: data.productType,
      weightGrams: data.weightGrams,
      dimensions: data.dimensions,
      variantsMatrix: data.variantsMatrix,
      status: data.status,
    })
    .returning();

  // 4. Insert Category Junction Links & Variants in Parallel
  const variantRows = data.variants.map((v) => ({
    ...v,
    merchantId,
    productId: createdProduct.id,
  }));

  const [insertedVariants] = await Promise.all([
    db.insert(productVariants).values(variantRows).returning(),
    data.categoryIds.length > 0
      ? db
          .insert(productCategories)
          .values(
            data.categoryIds.map((catId) => ({
              productId: createdProduct.id,
              categoryId: catId,
            })),
          )
      : Promise.resolve(),
  ]);

  await invalidateTenantCache(merchantId);

  return {
    ...createdProduct,
    categoryIds: data.categoryIds,
    variants: insertedVariants,
  };
};