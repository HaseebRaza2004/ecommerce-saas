import { Router } from "express";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  sendWhatsappOtp,
  customerOmniAuth,
  merchantOmniAuth,
} from "./omniAuth.controller.js";

const router = Router();

// 1. Send 6-Digit WhatsApp OTP (Max 5 per 10 mins per IP)
router.post(
  "/whatsapp/send-otp",
  rateLimiter(5, 600, "wa_otp_send"),
  sendWhatsappOtp,
);

// 2. Unified Storefront Customer Login/Signup (Google, Apple/Cloud ID, WhatsApp OTP, Email)
router.post(
  "/customer",
  resolveTenant,
  rateLimiter(10, 300, "omni_cust_auth"),
  customerOmniAuth,
);

// 3. Unified Merchant Admin Login/Signup (Google, Apple/Cloud ID, WhatsApp OTP, Email)
router.post(
  "/merchant",
  rateLimiter(10, 300, "omni_merch_auth"),
  merchantOmniAuth,
);

export default router;