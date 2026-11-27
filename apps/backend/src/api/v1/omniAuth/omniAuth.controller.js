import { sendResponse } from "../../../utils/responseHandler.js";
import { sendTokenResponse } from "../../../utils/jwt.util.js";
import { sendCustomerTokenResponse } from "../../../utils/customerJwt.util.js";
import { extractClientIp } from "../../../utils/ip.util.js";
import {
  checkAccountLockout,
  recordFailedLogin,
  evaluateLoginAnomaly,
} from "../../../core/security/loginAnomaly.service.js";
import {
  validateWhatsappOtpRequest,
  validateOmniAuthInput,
} from "./validators/omniAuth.validator.js";
import {
  sendWhatsappOtpService,
  verifyWhatsappOtpService,
} from "./services/whatsappOtp.service.js";
import { verifyOAuthIdentityService } from "./services/oauthVerifier.service.js";
import { resolveCustomerIdentityService } from "./services/resolveCustomerIdentity.service.js";
import { resolveMerchantIdentityService } from "./services/resolveMerchantIdentity.service.js";

export const sendWhatsappOtp = async (req, res, next) => {
  try {
    const cleanInput = validateWhatsappOtpRequest(req.body);
    const result = await sendWhatsappOtpService(cleanInput);
    return sendResponse(res, 200, "WhatsApp verification OTP sent.", result);
  } catch (error) {
    next(error);
  }
};

export const customerOmniAuth = async (req, res, next) => {
  const ip = extractClientIp(req);
  let lockKey = null;
  try {
    const data = validateOmniAuthInput(req.body);
    lockKey = `cust:${req.merchantId}:${data.email || data.phone || ip}`;
    await checkAccountLockout(lockKey);

    if (data.provider === "whatsapp_otp") {
      await verifyWhatsappOtpService(data.phone, "customer", data.otpCode);
    } else if (data.provider === "google" || data.provider === "apple_cloud") {
      Object.assign(data, await verifyOAuthIdentityService(data));
    }

    const customer = await resolveCustomerIdentityService(req.merchantId, data);
    return sendCustomerTokenResponse(
      customer,
      200,
      res,
      `Authenticated via ${data.provider} into unified account.`,
    );
  } catch (error) {
    if (error.statusCode === 401 && lockKey)
      await recordFailedLogin(lockKey, ip);
    next(error);
  }
};

export const merchantOmniAuth = async (req, res, next) => {
  const ip = extractClientIp(req);
  let lockKey = null;
  try {
    const data = validateOmniAuthInput(req.body);
    lockKey = `console:${data.email || data.phone || ip}`;
    await checkAccountLockout(lockKey);

    if (data.provider === "whatsapp_otp") {
      await verifyWhatsappOtpService(data.phone, "merchant", data.otpCode);
    } else if (data.provider === "google" || data.provider === "apple_cloud") {
      Object.assign(data, await verifyOAuthIdentityService(data));
    }

    const result = await resolveMerchantIdentityService(data);
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
      `Authenticated via ${data.provider} into Admin Console.`,
      req,
    );
  } catch (error) {
    if ((error.statusCode === 401 || error.status === 401) && lockKey) {
      await recordFailedLogin(lockKey, ip);
    }
    next(error);
  }
};