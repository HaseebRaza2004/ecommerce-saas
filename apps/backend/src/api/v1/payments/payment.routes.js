import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  updatePaymentConfig,
  getCheckoutOptions,
  getCurrencyQuote,
} from "./payment.controller.js";

const router = Router();

// 🌐 Public Storefront Checkout Options & Multi-Currency Display Converter
router.get(
  "/checkout-options",
  resolveTenant,
  rateLimiter(120, 60, "pay_options"),
  getCheckoutOptions,
);
router.get(
  "/currency-quote",
  resolveTenant,
  rateLimiter(120, 60, "fx_quote"),
  getCurrencyQuote,
);

// 🔐 Strictly Admin Protected BYOK Payment Vault Update
router.put(
  "/config",
  requireAuth,
  rateLimiter(20, 60, "pay_config_save"),
  updatePaymentConfig,
);

export default router;