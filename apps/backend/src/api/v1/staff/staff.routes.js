import { Router } from "express";
import {
  requireAuth,
  restrictTo,
} from "../../../core/middlewares/auth.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  createStaff,
  loginStaff,
  getStaffList,
  deleteStaff,
} from "./staff.controller.js";

const router = Router();

//  Zero-Domain Unified Staff Login Alias
router.post("/login", rateLimiter(5, 900, "staff_login"), loginStaff);

//  Strictly Super-Merchant / SaaS Super Admin Routes
router.use(requireAuth, restrictTo("super_merchant"));
router.post("/", rateLimiter(20, 60, "staff_create"), createStaff);
router.get("/", rateLimiter(60, 60, "staff_list"), getStaffList);
router.delete("/:id", rateLimiter(20, 60, "staff_delete"), deleteStaff);

export default router;
