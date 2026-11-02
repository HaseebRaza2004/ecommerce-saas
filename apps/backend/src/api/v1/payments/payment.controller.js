import { sendResponse } from "../../../utils/responseHandler.js";
import { validatePaymentConfigInput } from "./validators/paymentConfig.validator.js";
import { savePaymentConfigService } from "./services/savePaymentConfig.service.js";
import { getCheckoutOptionsService } from "./services/getCheckoutOptions.service.js";
import { getCurrencyDisplayQuoteService } from "./services/currencyRate.service.js";

export const updatePaymentConfig = async (req, res, next) => {
  try {
    const cleanData = validatePaymentConfigInput(req.body);
    const saved = await savePaymentConfigService(req.merchantId, cleanData);
    return sendResponse(
      res,
      200,
      "Payment gateway & QR configuration saved securely.",
      saved,
    );
  } catch (error) {
    next(error);
  }
};

export const getCheckoutOptions = async (req, res, next) => {
  try {
    const buyerCountry =
      req.query.country ||
      req.headers["cf-ipcountry"] ||
      req.headers["x-vercel-ip-country"] ||
      "PK";
    const options = await getCheckoutOptionsService(
      req.merchantId,
      buyerCountry,
    );
    return sendResponse(res, 200, "Checkout payment options fetched.", options);
  } catch (error) {
    next(error);
  }
};

export const getCurrencyQuote = async (req, res, next) => {
  try {
    const country =
      req.query.country ||
      req.headers["cf-ipcountry"] ||
      req.headers["x-vercel-ip-country"] ||
      "PK";
    const amount = req.query.amount || 1000;
    const quote = await getCurrencyDisplayQuoteService(country, amount);
    return sendResponse(res, 200, "Display currency rate calculated.", quote);
  } catch (error) {
    next(error);
  }
};