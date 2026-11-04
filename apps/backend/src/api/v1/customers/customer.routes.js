import { Router } from "express";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { requireCustomerAuth } from "../../../core/middlewares/customer.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  registerCustomer,
  loginCustomer,
  getCustomerMe,
  logoutCustomer,
} from "./customer.controller.js";

const router = Router();

// All storefront customer routes require store tenant context (?domain= or x-store-domain)
router.use(resolveTenant);

router.post(
  "/register",
  rateLimiter(5, 900, "cust_register"),
  registerCustomer,
);
router.post("/login", rateLimiter(5, 900, "cust_login"), loginCustomer);
router.get(
  "/me",
  requireCustomerAuth,
  rateLimiter(60, 60, "cust_me"),
  getCustomerMe,
);
router.post(
  "/logout",
  requireCustomerAuth,
  rateLimiter(10, 60, "cust_logout"),
  logoutCustomer,
);

export default router;