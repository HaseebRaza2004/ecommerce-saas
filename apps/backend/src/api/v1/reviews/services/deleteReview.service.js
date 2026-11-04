import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { productReviews } = schema;

// Delete Unverified Spam Review (Blocks Deleting Verified Buyer Reviews — No Review Gating)
export const deleteReviewService = async (merchantId, reviewId) => {
  const existingRows = await db
    .select()
    .from(productReviews)
    .where(
      and(
        eq(productReviews.id, reviewId),
        eq(productReviews.merchantId, merchantId),
      ),
    )
    .limit(1);

  const review = existingRows[0];
  if (!review) {
    throw new AppError("Review not found in your store.", 404);
  }

  // No Review Gating Policy: Verified buyer reviews cannot be deleted. You may post an official merchantReply instead.
  if (review.isVerifiedPurchase) {
    throw new AppError(
      "No Review Gating Policy: Verified buyer reviews cannot be deleted. You may post an official merchantReply instead.",
      403,
    );
  }

  const [deleted] = await db
    .delete(productReviews)
    .where(eq(productReviews.id, reviewId))
    .returning({ id: productReviews.id, productId: productReviews.productId });

  await invalidateTenantCache(merchantId);
  return deleted;
};