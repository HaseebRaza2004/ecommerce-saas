import { sendResponse } from "../../../utils/responseHandler.js";
import { validateStoreThemeInput } from "./validators/theme.validator.js";
import { validateStorePoliciesInput } from "./validators/policy.validator.js";
import { getStoreBootstrapService } from "./services/getStoreBootstrap.service.js";
import { updateStoreThemeService } from "./services/updateStoreTheme.service.js";
import { updateStorePoliciesService } from "./services/updateStorePolicies.service.js";

export const getBootstrap = async (req, res, next) => {
  try {
    const data = await getStoreBootstrapService(req.merchantId);
    return sendResponse(
      res,
      200,
      "Storefront bootstrap configuration fetched.",
      data,
    );
  } catch (error) {
    next(error);
  }
};

export const updateTheme = async (req, res, next) => {
  try {
    const cleanData = validateStoreThemeInput(req.body);
    const updated = await updateStoreThemeService(req.merchantId, cleanData);
    return sendResponse(
      res,
      200,
      "Storefront theme and UI layout updated.",
      updated,
    );
  } catch (error) {
    next(error);
  }
};

export const updatePolicies = async (req, res, next) => {
  try {
    const cleanData = validateStorePoliciesInput(req.body);
    const saved = await updateStorePoliciesService(req.merchantId, cleanData);
    return sendResponse(res, 200, "Store policies and FAQs updated.", saved);
  } catch (error) {
    next(error);
  }
};