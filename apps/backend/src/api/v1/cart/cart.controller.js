import { sendResponse } from "../../../utils/responseHandler.js";
import { validateCartQuoteInput } from "./validators/cartQuote.validator.js";
import { calculateCartQuoteService } from "./services/calculateCartQuote.service.js";

export const getCartQuote = async (req, res, next) => {
  try {
    const cleanInput = validateCartQuoteInput(req.body);
    const quote = await calculateCartQuoteService(req.merchantId, cleanInput);
    return sendResponse(res, 200, "Cart quote calculated securely.", quote);
  } catch (error) {
    next(error);
  }
};