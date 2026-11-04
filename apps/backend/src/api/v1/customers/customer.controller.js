import { sendResponse } from "../../../utils/responseHandler.js";
import {
  sendCustomerTokenResponse,
  clearCustomerTokenCookie,
} from "../../../utils/customerJwt.util.js";
import { blacklistToken } from "../../../core/redis/tokenBlacklist.service.js";
import {
  validateCustomerRegister,
  validateCustomerLogin,
} from "./validators/customerAuth.validator.js";
import { registerCustomerService } from "./services/registerCustomer.service.js";
import { loginCustomerService } from "./services/loginCustomer.service.js";
import { getCustomerProfileService } from "./services/getCustomerProfile.service.js";

export const registerCustomer = async (req, res, next) => {
  try {
    const cleanData = validateCustomerRegister(req.body);
    const customer = await registerCustomerService(req.merchantId, cleanData);
    return sendCustomerTokenResponse(
      customer,
      201,
      res,
      "Customer account registered successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const loginCustomer = async (req, res, next) => {
  try {
    const cleanData = validateCustomerLogin(req.body);
    const customer = await loginCustomerService(req.merchantId, cleanData);
    return sendCustomerTokenResponse(
      customer,
      200,
      res,
      "Customer logged in successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const getCustomerMe = async (req, res, next) => {
  try {
    const profile = await getCustomerProfileService(
      req.merchantId,
      req.customerId,
    );
    return sendResponse(
      res,
      200,
      "Customer profile and orders fetched.",
      profile,
    );
  } catch (error) {
    next(error);
  }
};

export const logoutCustomer = async (req, res, next) => {
  try {
    await blacklistToken(req.rawCustomerToken, 900);
    clearCustomerTokenCookie(res);
    return sendResponse(res, 200, "Customer logged out safely.");
  } catch (error) {
    next(error);
  }
};