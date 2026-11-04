import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  createReview,
  getProductReviews,
  replyToReview,
  deleteReview,
} from "./review.controller.js";

const router = Router();

// Public Storefront Read & Buyer Review Submission
router.get(
  "/product/:productId",
  resolveTenant,
  rateLimiter(120, 60, "rev_list"),
  getProductReviews,
);
router.post(
  "/",
  resolveTenant,
  rateLimiter(10, 600, "rev_create"),
  createReview,
);

// Admin Official Reply & Spam Moderation
router.put(
  "/:id/reply",
  requireAuth,
  rateLimiter(20, 60, "rev_reply"),
  replyToReview,
);
router.delete(
  "/:id",
  requireAuth,
  rateLimiter(20, 60, "rev_delete"),
  deleteReview,
);

export default router;