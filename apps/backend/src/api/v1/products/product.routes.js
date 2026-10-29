import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  createProduct,
  getProducts,
  getProductDetail,
  deleteProduct,
} from "./product.controller.js";

const router = Router();

// Public Storefront (Guest) + Admin Console Read Endpoints
router.get("/", resolveTenant, rateLimiter(120, 60, "prod_list"), getProducts);
router.get(
  "/:slugOrId",
  resolveTenant,
  rateLimiter(120, 60, "prod_detail"),
  getProductDetail,
);

// Strictly Admin Protected Write Endpoints
router.post(
  "/",
  requireAuth,
  rateLimiter(30, 60, "prod_create"),
  createProduct,
);
router.delete(
  "/:id",
  requireAuth,
  rateLimiter(20, 60, "prod_delete"),
  deleteProduct,
);

export default router;