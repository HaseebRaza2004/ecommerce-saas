import { and, eq, inArray } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { products, productCategories, productVariants, categories } = schema;

// Update a product and its variants in the database
export const updateProductService = async (merchantId, productId, data) => {
  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.id, productId), eq(products.merchantId, merchantId)))
    .limit(1);

  if (!existing[0]) {
    throw new AppError("Product not found in your store.", 404);
  }

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

  const [updatedProduct] = await db
    .update(products)
    .set({
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
    .where(and(eq(products.id, productId), eq(products.merchantId, merchantId)))
    .returning();

  // Replace old variants & category links with updated matrix
  await Promise.all([
    db.delete(productVariants).where(eq(productVariants.productId, productId)),
    db
      .delete(productCategories)
      .where(eq(productCategories.productId, productId)),
  ]);

  const variantRows = data.variants.map((v) => ({
    ...v,
    merchantId,
    productId,
  }));
  const [insertedVariants] = await Promise.all([
    db.insert(productVariants).values(variantRows).returning(),
    data.categoryIds.length > 0
      ? db
          .insert(productCategories)
          .values(
            data.categoryIds.map((catId) => ({ productId, categoryId: catId })),
          )
      : Promise.resolve(),
  ]);

  await invalidateTenantCache(merchantId);
  return {
    ...updatedProduct,
    categoryIds: data.categoryIds,
    variants: insertedVariants,
  };
};