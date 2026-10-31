import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  placeOrder,
  trackOrderPublic,
  getMerchantOrders,
  verifyOrderDelivery,
} from "./order.controller.js";

const router = Router();

// 🌐 Public Storefront Checkout & Live Order Lookup
router.post(
  "/checkout",
  resolveTenant,
  rateLimiter(15, 60, "order_checkout"),
  placeOrder,
);
router.get(
  "/track",
  resolveTenant,
  rateLimiter(30, 60, "order_track"),
  trackOrderPublic,
);

// 🔐 Admin Console & Rider Delivery Handshake Routes
router.get(
  "/",
  requireAuth,
  rateLimiter(60, 60, "order_admin_list"),
  getMerchantOrders,
);
router.post(
  "/:id/verify-delivery",
  requireAuth,
  rateLimiter(20, 60, "order_delivery_pin"),
  verifyOrderDelivery,
);

export default router;