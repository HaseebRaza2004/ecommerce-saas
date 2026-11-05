import { sendResponse } from "../../../utils/responseHandler.js";
import { sendTokenResponse } from "../../../utils/jwt.util.js";
import { sendCustomerTokenResponse } from "../../../utils/customerJwt.util.js";
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
  try {
    const data = validateOmniAuthInput(req.body);
    if (data.provider === "whatsapp_otp") {
      await verifyWhatsappOtpService(data.phone, "customer", data.otpCode);
    } else if (data.provider === "google" || data.provider === "apple_cloud") {
      const verified = await verifyOAuthIdentityService(data);
      Object.assign(data, verified);
    }
    const customer = await resolveCustomerIdentityService(req.merchantId, data);
    return sendCustomerTokenResponse(
      customer,
      200,
      res,
      `Authenticated via ${data.provider} into unified account.`,
    );
  } catch (error) {
    next(error);
  }
};

export const merchantOmniAuth = async (req, res, next) => {
  try {
    const data = validateOmniAuthInput(req.body);
    if (data.provider === "whatsapp_otp") {
      await verifyWhatsappOtpService(data.phone, "merchant", data.otpCode);
    } else if (data.provider === "google" || data.provider === "apple_cloud") {
      const verified = await verifyOAuthIdentityService(data);
      Object.assign(data, verified);
    }
    const merchant = await resolveMerchantIdentityService(data);
    return sendTokenResponse(
      merchant,
      200,
      res,
      `Merchant authenticated via ${data.provider} into unified store.`,
    );
  } catch (error) {
    next(error);
  }
};