import { sendResponse } from "../../../utils/responseHandler.js";
import { sendTokenResponse } from "../../../utils/jwt.util.js";
import { extractClientIp } from "../../../utils/ip.util.js";
import {
  checkAccountLockout,
  recordFailedLogin,
  evaluateLoginAnomaly,
} from "../../../core/security/loginAnomaly.service.js";
import {
  validateCreateStaffInput,
  validateStaffLoginInput,
} from "./validators/staff.validator.js";
import { createStaffService } from "./services/createStaff.service.js";
import { loginStaffService } from "./services/loginStaff.service.js";
import {
  getStaffListService,
  deleteStaffService,
} from "./services/manageStaff.service.js";

export const createStaff = async (req, res, next) => {
  try {
    const cleanData = validateCreateStaffInput(req.body);
    const staff = await createStaffService(req.merchantId, cleanData);
    return sendResponse(res, 201, "Staff account created successfully.", staff);
  } catch (error) {
    next(error);
  }
};

export const loginStaff = async (req, res, next) => {
  const ip = extractClientIp(req);
  let lockKey = null;
  try {
    const cleanData = validateStaffLoginInput(req.body);
    lockKey = `staff:${req.merchantId}:${cleanData.email}`;
    await checkAccountLockout(lockKey);

    const staffPayload = await loginStaffService(req.merchantId, cleanData);
    await evaluateLoginAnomaly(
      staffPayload.staff_id,
      ip,
      req.headers["user-agent"],
    );

    return await sendTokenResponse(
      staffPayload,
      200,
      res,
      "Staff logged in successfully.",
      req,
    );
  } catch (error) {
    if (error.statusCode === 401 && lockKey)
      await recordFailedLogin(lockKey, ip);
    next(error);
  }
};

export const getStaffList = async (req, res, next) => {
  try {
    const list = await getStaffListService(req.merchantId);
    return sendResponse(res, 200, "Store staff list fetched.", list);
  } catch (error) {
    next(error);
  }
};

export const deleteStaff = async (req, res, next) => {
  try {
    const deleted = await deleteStaffService(req.merchantId, req.params.id);
    return sendResponse(res, 200, "Staff member removed.", deleted);
  } catch (error) {
    next(error);
  }
};