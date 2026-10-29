import { Router } from "express";
import { requireAuth } from "../../../core/middlewares/auth.guard.js";
import { rateLimiter } from "../../../core/middlewares/rateLimiter.js";
import { createPromotion, getPromotions } from "./promotion.controller.js";

const router = Router();

router.use(requireAuth);

router.post("/", rateLimiter(20, 60, "promo_create"), createPromotion);
router.get("/", rateLimiter(60, 60, "promo_list"), getPromotions);

export default router;