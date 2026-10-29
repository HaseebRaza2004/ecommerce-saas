import { sendResponse } from "../../../utils/responseHandler.js";
import { validateCreatePromotion } from "./validators/promotion.validator.js";
import { createPromotionService } from "./services/createPromotion.service.js";
import { getPromotionsService } from "./services/getPromotions.service.js";

export const createPromotion = async (req, res, next) => {
  try {
    const cleanData = validateCreatePromotion(req.body);
    const promo = await createPromotionService(req.merchantId, cleanData);
    return sendResponse(res, 201, "Promotion created successfully.", promo);
  } catch (error) {
    next(error);
  }
};

export const getPromotions = async (req, res, next) => {
  try {
    const list = await getPromotionsService(req.merchantId);
    return sendResponse(res, 200, "Promotions fetched successfully.", list);
  } catch (error) {
    next(error);
  }
};