import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { productReviews } = schema;

// Post Official Merchant Reply to a Customer Review
export const replyToReviewService = async (
  merchantId,
  { reviewId, merchantReply },
) => {
  const [updated] = await db
    .update(productReviews)
    .set({
      merchantReply,
      repliedAt: new Date(),
    })
    .where(
      and(
        eq(productReviews.id, reviewId),
        eq(productReviews.merchantId, merchantId),
      ),
    )
    .returning();

  if (!updated) {
    throw new AppError("Review not found in your store.", 404);
  }

  await invalidateTenantCache(merchantId);
  return updated;
};