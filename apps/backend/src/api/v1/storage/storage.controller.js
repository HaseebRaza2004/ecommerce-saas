import { sendResponse } from "../../../utils/responseHandler.js";
import { validateUploadRequest } from "./validators/uploadUrl.validator.js";
import { generatePresignedUploadService } from "./services/presignUpload.service.js";
import { generatePrivateReadUrlService } from "./services/presignPrivateRead.service.js";

export const createUploadUrl = async (req, res, next) => {
  try {
    const cleanData = validateUploadRequest(req.body);
    const result = await generatePresignedUploadService(
      req.merchantId,
      cleanData,
    );
    return sendResponse(res, 201, "Pre-signed upload URL generated.", result);
  } catch (error) {
    next(error);
  }
};

export const getPrivateVaultUrl = async (req, res, next) => {
  try {
    const { objectKey } = req.body;
    const result = await generatePrivateReadUrlService(
      req.merchantId,
      objectKey,
    );
    return sendResponse(
      res,
      200,
      "Temporary private read URL generated.",
      result,
    );
  } catch (error) {
    next(error);
  }
};