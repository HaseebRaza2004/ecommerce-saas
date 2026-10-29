import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import { createUploadUrl, getPrivateVaultUrl } from "./storage.controller.js";

const router = Router();

router.use(requireAuth);

// 1. Generate Pre-Signed PUT URL (Max 30 uploads per minute per merchant)
router.post(
  "/presign-upload",
  rateLimiter(30, 60, "r2_upload"),
  createUploadUrl,
);

// 2. Generate Temporary GET URL for Private KYC Vault (Max 20 per minute)
router.post(
  "/presign-private-read",
  rateLimiter(20, 60, "r2_private_read"),
  getPrivateVaultUrl,
);

export default router;