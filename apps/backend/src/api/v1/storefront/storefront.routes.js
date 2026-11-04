import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  getBootstrap,
  updateTheme,
  updatePolicies,
} from "./storefront.controller.js";

const router = Router();

router.get(
  "/bootstrap",
  resolveTenant,
  rateLimiter(120, 60, "store_bootstrap"),
  getBootstrap,
);
router.put(
  "/theme",
  requireAuth,
  rateLimiter(20, 60, "store_theme_put"),
  updateTheme,
);
router.put(
  "/policies",
  requireAuth,
  rateLimiter(20, 60, "store_policy_put"),
  updatePolicies,
);

export default router;