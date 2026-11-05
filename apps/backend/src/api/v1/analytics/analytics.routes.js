import { Router } from "express";
import {
  requireAuth,
  restrictTo,
} from "../../../core/middlewares/auth.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  getDashboardStats,
  getSubscription,
  upgradeSubscription,
} from "./analytics.controller.js";

const router = Router();

router.use(requireAuth);

// 1. Live Dashboard KPIs (Accessible by Super-Merchant & Store Manager)
router.get(
  "/dashboard",
  restrictTo("super_merchant", "store_manager"),
  rateLimiter(60, 60, "dash_stats"),
  getDashboardStats,
);

// 2. SaaS Subscription Details & Plan Upgrade (Strictly Super-Merchant Owner)
router.get(
  "/subscription",
  restrictTo("super_merchant"),
  rateLimiter(60, 60, "sub_get"),
  getSubscription,
);
router.put(
  "/subscription",
  restrictTo("super_merchant"),
  rateLimiter(10, 60, "sub_put"),
  upgradeSubscription,
);

export default router;