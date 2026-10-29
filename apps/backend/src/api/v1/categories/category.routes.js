import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import {
  createCategory,
  getCategories,
  deleteCategory,
} from "./category.controller.js";

const router = Router();

router.use(requireAuth);

// 1. Create Main or Sub-Category (Max 30 per minute)
router.post("/", rateLimiter(30, 60, "cat_create"), createCategory);
// 2. Get Full Nested Category Tree & Flat List (Cached in Redis/L1)
router.get("/", rateLimiter(120, 60, "cat_list"), getCategories);
// 3. Delete Category & Sub-Tree (Max 20 per minute)
router.delete("/:id", rateLimiter(20, 60, "cat_delete"), deleteCategory);

export default router;