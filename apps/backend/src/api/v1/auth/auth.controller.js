import { sendResponse } from "../../../utils/responseHandler.js";
import { sendTokenResponse, clearTokenCookie } from "../../../utils/jwt.util.js";
import { blacklistToken } from "../../../core/redis/tokenBlacklist.service.js";
import { validateLoginInput } from "./validators/login.validator.js";
import { validateRegisterInput } from "./validators/register.validator.js";
import { adminRegisterService } from "./services/registerAdmin.service.js";
import { adminLoginService } from "./services/loginAdmin.service.js";
import { getAdminProfileService } from "./services/getAdminProfile.service.js";

export const adminRegister = async (req, res, next) => {
  try {
    const cleanData = validateRegisterInput(req.body);
    const merchantData = await adminRegisterService(cleanData);
    return sendTokenResponse(
      merchantData,
      201,
      res,
      "Store created and logged in successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = validateLoginInput(req.body);
    const merchantData = await adminLoginService(email, password);
    return sendTokenResponse(
      merchantData,
      200,
      res,
      "Admin logged in successfully.",
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminMe = async (req, res, next) => {
  try {
    const profile = await getAdminProfileService(req.merchantId);
    return sendResponse(
      res,
      200,
      "Merchant profile fetched successfully.",
      profile,
    );
  } catch (error) {
    next(error);
  }
};

export const adminLogout = async (req, res, next) => {
  try {
    await blacklistToken(req.rawToken, 900);
    clearTokenCookie(res);
    return sendResponse(res, 200, "Logged out safely. Session terminated.");
  } catch (error) {
    next(error);
  }
};