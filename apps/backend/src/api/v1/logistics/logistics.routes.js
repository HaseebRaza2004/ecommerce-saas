import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  createCourier,
  getCouriers,
  createZone,
  getZones,
  calculateShipping,
} from "./logistics.controller.js";

const router = Router();

// Public Storefront (Guest) & Checkout Shipping Rate Calculator
router.post(
  "/calculate-shipping",
  resolveTenant,
  rateLimiter(60, 60, "ship_quote"),
  calculateShipping,
);

// Merchant Admin Panel (Authenticated) - Courier & Zone Management
router.post(
  "/couriers",
  requireAuth,
  rateLimiter(20, 60, "courier_create"),
  createCourier,
);
router.get(
  "/couriers",
  requireAuth,
  rateLimiter(60, 60, "courier_list"),
  getCouriers,
);

router.post(
  "/zones",
  requireAuth,
  rateLimiter(20, 60, "zone_create"),
  createZone,
);
router.get("/zones", requireAuth, rateLimiter(60, 60, "zone_list"), getZones);

export default router;