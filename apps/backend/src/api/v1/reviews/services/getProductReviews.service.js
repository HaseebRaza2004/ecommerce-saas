import { and, eq, desc } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { productReviews, customers } = schema;

// Fetch Published Product Reviews + Buyer Name + Merchant Replies + 5-Star Summary
export const getProductReviewsService = async (merchantId, productId) => {
  return await getOrSetTenantCache(
    merchantId,
    `reviews:prod:${productId}`,
    async () => {
      const rows = await db
        .select({
          id: productReviews.id,
          rating: productReviews.rating,
          comment: productReviews.comment,
          images: productReviews.images,
          isVerifiedPurchase: productReviews.isVerifiedPurchase,
          status: productReviews.status,
          merchantReply: productReviews.merchantReply,
          repliedAt: productReviews.repliedAt,
          createdAt: productReviews.createdAt,
          customerName: customers.name,
        })
        .from(productReviews)
        .leftJoin(customers, eq(productReviews.customerId, customers.id))
        .where(
          and(
            eq(productReviews.merchantId, merchantId),
            eq(productReviews.productId, productId),
            eq(productReviews.status, "published"),
          ),
        )
        .orderBy(desc(productReviews.createdAt))
        .limit(50);

      const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      let ratingSum = 0;

      const formatted = rows.map((r) => {
        ratingSum += r.rating;
        if (starCounts[r.rating] !== undefined) starCounts[r.rating] += 1;
        return {
          ...r,
          customerName: r.customerName || "Verified Buyer",
        };
      });

      const totalReviews = formatted.length;
      const averageRating =
        totalReviews > 0 ? Number((ratingSum / totalReviews).toFixed(2)) : 0;

      return {
        total_reviews: totalReviews,
        average_rating: averageRating,
        star_breakdown: starCounts,
        reviews: formatted,
      };
    },
    1800,
  );
};