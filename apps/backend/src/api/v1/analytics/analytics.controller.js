import { sendResponse } from "../../../utils/responseHandler.js";
import { getDashboardStatsService } from "./services/getDashboardStats.service.js";
import {
  getSubscriptionService,
  upgradeSubscriptionService,
} from "./services/getSubscription.service.js";

export const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await getDashboardStatsService(req.merchantId);
    return sendResponse(res, 200, "Dashboard analytics fetched.", stats);
  } catch (error) {
    next(error);
  }
};

export const getSubscription = async (req, res, next) => {
  try {
    const sub = await getSubscriptionService(req.merchantId);
    return sendResponse(
      res,
      200,
      "Merchant subscription details fetched.",
      sub,
    );
  } catch (error) {
    next(error);
  }
};

export const upgradeSubscription = async (req, res, next) => {
  try {
    const updated = await upgradeSubscriptionService(req.merchantId, req.body);
    return sendResponse(
      res,
      200,
      "Subscription plan updated successfully.",
      updated,
    );
  } catch (error) {
    next(error);
  }
};