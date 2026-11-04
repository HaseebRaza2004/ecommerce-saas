import { sendResponse } from "../../../utils/responseHandler.js";
import {
  validateCreateReview,
  validateMerchantReply,
} from "./validators/review.validator.js";
import { createReviewService } from "./services/createReview.service.js";
import { getProductReviewsService } from "./services/getProductReviews.service.js";
import { replyToReviewService } from "./services/replyToReview.service.js";
import { deleteReviewService } from "./services/deleteReview.service.js";

export const createReview = async (req, res, next) => {
  try {
    const cleanData = validateCreateReview(req.body);
    const review = await createReviewService(req.merchantId, cleanData);
    return sendResponse(res, 201, "Review submitted successfully.", review);
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req, res, next) => {
  try {
    const result = await getProductReviewsService(
      req.merchantId,
      req.params.productId,
    );
    return sendResponse(
      res,
      200,
      "Product reviews fetched successfully.",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const replyToReview = async (req, res, next) => {
  try {
    const cleanData = validateMerchantReply(req.params.id, req.body);
    const updated = await replyToReviewService(req.merchantId, cleanData);
    return sendResponse(res, 200, "Official merchant reply posted.", updated);
  } catch (error) {
    next(error);
  }
};

export const deleteReview = async (req, res, next) => {
  try {
    const deleted = await deleteReviewService(req.merchantId, req.params.id);
    return sendResponse(res, 200, "Unverified review deleted.", deleted);
  } catch (error) {
    next(error);
  }
};