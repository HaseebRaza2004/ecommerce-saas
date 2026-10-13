import { Router } from "express";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import { adminLogin } from "./auth.controller.js";

const router = Router();

/**
 * 🛡️ ADMIN & MERCHANT AUTHENTICATION ROUTES
 * API Version: v1
 */

// Route: POST /api/v1/auth/admin/login
// Security: Brute-force attacks (password guessing) se bachne ke liye limit lagayi hai.
// 15 minutes (900 seconds) mein sirf 5 attempts allowed hain per IP.
router.post("/admin/login", rateLimiter(5, 900), adminLogin);

export default router;
