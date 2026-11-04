import { AppError } from "../../../../core/errors/AppError.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanStr = (val, max = 500) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate Customer Product Review Submission
export const validateCreateReview = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid review payload.", 400);
  }

  const { productId } = body;
  if (
    !productId ||
    typeof productId !== "string" ||
    !UUID_REGEX.test(productId)
  ) {
    throw new AppError("A valid productId UUID is required.", 400);
  }

  const rating = parseInt(body.rating, 10);
  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    throw new AppError("Rating must be an integer between 1 and 5 stars.", 400);
  }

  const customerPhone = cleanStr(body.customerPhone, 50);
  const comment = cleanStr(body.comment, 1500);

  if (customerPhone.length < 7) {
    throw new AppError(
      "Valid customerPhone is required to verify purchase history.",
      400,
    );
  }
  if (comment.length < 3) {
    throw new AppError("Review comment must be at least 3 characters.", 400);
  }

  const images = Array.isArray(body.images)
    ? body.images
        .filter((u) => typeof u === "string" && u.startsWith("https://"))
        .slice(0, 4)
    : [];

  return { productId, rating, customerPhone, comment, images };
};

// Validate Merchant Official Reply to a Review
export const validateMerchantReply = (reviewId, body) => {
  if (!reviewId || !UUID_REGEX.test(reviewId)) {
    throw new AppError("Invalid review ID format.", 400);
  }
  const merchantReply = cleanStr(body?.merchantReply, 1000);
  if (merchantReply.length < 2) {
    throw new AppError(
      "merchantReply must be between 2 and 1000 characters.",
      400,
    );
  }
  return { reviewId, merchantReply };
};