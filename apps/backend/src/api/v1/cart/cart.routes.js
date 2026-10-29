import { Router } from "express";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import { getCartQuote } from "./cart.controller.js";

const router = Router();

// Logged-In Customer Cart Calculation Endpoint
router.post(
  "/quote",
  resolveTenant,
  rateLimiter(60, 60, "cart_quote"),
  getCartQuote,
);

export default router;