import { Router } from "express";
import {
  requireAuth,
  restrictTo,
} from "../../../core/middlewares/auth.guard.js";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  createStaff,
  loginStaff,
  getStaffList,
  deleteStaff,
} from "./staff.controller.js";

const router = Router();

//  Staff Login (Requires Store Domain Context ?domain=electrohub.pk)
router.post(
  "/login",
  resolveTenant,
  rateLimiter(5, 900, "staff_login"),
  loginStaff,
);

//  Strictly Super-Merchant Owner Routes (Staff cannot create/delete other staff!)
router.use(requireAuth, restrictTo("super_merchant"));
router.post("/", rateLimiter(20, 60, "staff_create"), createStaff);
router.get("/", rateLimiter(60, 60, "staff_list"), getStaffList);
router.delete("/:id", rateLimiter(20, 60, "staff_delete"), deleteStaff);

export default router;