import { sendResponse } from "../../../utils/responseHandler.js";
import { extractClientIp } from "../../../utils/ip.util.js";
import { validateKycSubmission } from "./validators/kycSubmit.validator.js";
import { createKycSessionService, getQrSessionStatusService } from "./services/kycSession.service.js";
import { submitMerchantKycService } from "./services/submitKyc.service.js";
import { getMerchantKycStatusService } from "./services/getKycStatus.service.js";

export const initKycSession = async (req, res, next) => {
  try {
    const sessionData = await createKycSessionService(req.merchantId);
    return sendResponse(
      res,
      201,
      "Live verification challenge initialized.",
      sessionData,
    );
  } catch (error) {
    next(error);
  }
};

export const checkQrSessionStatus = async (req, res, next) => {
  try {
    const result = await getQrSessionStatusService(
      req.merchantId,
      req.params.token,
    );
    return sendResponse(res, 200, "QR session status fetched.", result);
  } catch (error) {
    next(error);
  }
};

export const submitKyc = async (req, res, next) => {
  try {
    const cleanData = validateKycSubmission(req.body);
    const clientIp = extractClientIp(req);
    const result = await submitMerchantKycService(
      req.merchantId,
      cleanData,
      clientIp,
    );
    return sendResponse(
      res,
      200,
      "KYC verification submitted and encrypted successfully.",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getKycStatus = async (req, res, next) => {
  try {
    const statusData = await getMerchantKycStatusService(req.merchantId);
    return sendResponse(
      res,
      200,
      "KYC status retrieved successfully.",
      statusData,
    );
  } catch (error) {
    next(error);
  }
};