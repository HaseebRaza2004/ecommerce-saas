import { Router } from "express";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import {
  adminRegister,
  adminLogin,
  getAdminMe,
  adminLogout,
} from "./auth.controller.js";
import {
  refreshAdminSession,
  getActiveSessions,
  forceLogoutAllDevices,
} from "./session.controller.js";

const router = Router();

/**
 * 🛡️ ADMIN AUTH ROUTES (Multi-Layered Rate Limiting Applied per Endpoint)
 */

// 1. Register New Store: Max 3 signups per 15 mins per IP (Anti-Bot Store Spam)
router.post(
  "/admin/register",
  rateLimiter(3, 900, "auth_register"),
  adminRegister,
);

// 2. Admin Login: Max 5 attempts per 15 mins per IP (Brute-Force Shield)
router.post("/admin/login", rateLimiter(5, 900, "auth_login"), adminLogin);

// 3. Get Current Merchant Profile: Protected by JWT Guard + Per-Merchant Rate Limit (60 req/min)
router.get(
  "/admin/me",
  requireAuth,
  rateLimiter(60, 60, "auth_me"),
  getAdminMe,
);

// 4. Logout & Revoke Token: Protected by JWT Guard
router.post(
  "/admin/logout",
  requireAuth,
  rateLimiter(10, 60, "auth_logout"),
  adminLogout,
);

// 5. Refresh Admin Session: Rotate Access JWT + Refresh Token (Protected by Rate Limit)
router.post(
  "/admin/refresh",
  rateLimiter(20, 60, "auth_refresh"),
  refreshAdminSession,
);
// 6. List Active Sessions: Protected by JWT Guard + Rate Limit (30 req/min)
router.get(
  "/admin/sessions",
  requireAuth,
  rateLimiter(30, 60, "auth_sessions"),
  getActiveSessions,
);
// 7. Force Logout All Devices: Protected by JWT Guard + Rate Limit (5 req/5 mins)
router.post(
  "/admin/logout-all",
  requireAuth,
  rateLimiter(5, 300, "auth_kill_all"),
  forceLogoutAllDevices,
);

export default router;
