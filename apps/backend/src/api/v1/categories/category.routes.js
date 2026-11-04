import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} from "./category.controller.js";
import { resolveTenant } from "../../../core/middlewares/tenant.guard.js";

const router = Router();

// 1. Create Main or Sub-Category (Max 30 per minute)
router.post(
  "/",
  requireAuth,
  rateLimiter(30, 60, "cat_create"),
  createCategory,
);
// 2. Get Full Nested Category Tree & Flat List (Cached in Redis/L1)
router.get("/", resolveTenant, rateLimiter(120, 60, "cat_list"), getCategories);
// 3. Delete Category & Sub-Tree (Max 20 per minute)
router.delete(
  "/:id",
  requireAuth,
  rateLimiter(20, 60, "cat_delete"),
  deleteCategory,
);
// 4. Update Category Name, Slug, Grid Image URL, or Navbar Icon URL (Max 30 per minute)
router.put(
  "/:id",
  requireAuth,
  rateLimiter(30, 60, "cat_update"),
  updateCategory,
);

export default router;