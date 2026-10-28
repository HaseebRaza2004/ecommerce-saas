import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  initKycSession,
  checkQrSessionStatus,
  submitKyc,
  getKycStatus,
} from "./kyc.controller.js";

const router = Router();

// All KYC routes strictly require Merchant Authentication
router.use(requireAuth);

// 1. Generate 4-Digit Challenge & Mobile QR Sync Token (Max 10 per 10 mins)
router.post("/session", rateLimiter(10, 600, "kyc_session"), initKycSession);

// 2. Laptop Polling for Mobile QR Sync Status (Max 60 per min)
router.get(
  "/session/:token",
  rateLimiter(60, 60, "kyc_qr_poll"),
  checkQrSessionStatus,
);

// 3. Submit 4-Lock KYC Verification (Strict Limit: Max 5 attempts per 15 mins)
router.post("/submit", rateLimiter(5, 900, "kyc_submit"), submitKyc);

// 4. Fetch Current KYC Status (Cached in Redis)
router.get("/status", rateLimiter(60, 60, "kyc_status"), getKycStatus);

export default router;
