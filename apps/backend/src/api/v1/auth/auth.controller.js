import { sendResponse } from "../../../utils/responseHandler.js";
import {
  sendTokenResponse,
  clearTokenCookie,
} from "../../../utils/jwt.util.js";
import { extractClientIp } from "../../../utils/ip.util.js";
import { blacklistToken } from "../../../core/redis/tokenBlacklist.service.js";
import {
  checkAccountLockout,
  recordFailedLogin,
  evaluateLoginAnomaly,
} from "../../../core/security/loginAnomaly.service.js";
import { validateLoginInput } from "./validators/login.validator.js";
import { validateRegisterInput } from "./validators/register.validator.js";
import { adminRegisterService } from "./services/registerAdmin.service.js";
import { adminLoginService } from "./services/loginAdmin.service.js";
import { getAdminProfileService } from "./services/getAdminProfile.service.js";
import { consumeStoreSelectionService } from "./services/consoleStoreSelect.service.js";

export const adminRegister = async (req, res, next) => {
  try {
    const cleanData = validateRegisterInput(req.body);
    const merchantData = await adminRegisterService(cleanData);
    return await sendTokenResponse(
      merchantData,
      201,
      res,
      "Store created and logged in.",
      req,
    );
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  const ip = extractClientIp(req);
  let lockKey = null;
  try {
    const loginInput = validateLoginInput(req.body);
    lockKey = `console:${loginInput.identifier}`;
    await checkAccountLockout(lockKey);

    const result = await adminLoginService(loginInput);
    if (result.requires_store_selection) {
      return sendResponse(
        res,
        200,
        "Multiple stores found. Please select a store to continue.",
        result,
      );
    }

    await evaluateLoginAnomaly(result.actor_id, ip, req.headers["user-agent"]);
    return await sendTokenResponse(
      result,
      200,
      res,
      "Authenticated into Admin Console.",
      req,
    );
  } catch (error) {
    if ((error.statusCode === 401 || error.status === 401) && lockKey) {
      await recordFailedLogin(lockKey, ip);
    }
    next(error);
  }
};

export const selectConsoleStore = async (req, res, next) => {
  try {
    const { selectionToken, merchantId } = req.body || {};
    const account = await consumeStoreSelectionService(
      selectionToken,
      merchantId,
    );
    return await sendTokenResponse(
      account,
      200,
      res,
      "Store selected and logged in.",
      req,
    );
  } catch (error) {
    next(error);
  }
};

export const getAdminMe = async (req, res, next) => {
  try {
    const profile = await getAdminProfileService(
      req.merchantId,
      req.staffId,
      req.userRole,
    );
    return sendResponse(
      res,
      200,
      "Console profile fetched successfully.",
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