import { sendResponse } from "../../../utils/responseHandler.js";
import { validateCreateCourier } from "./validators/courier.validator.js";
import { validateCreateZone } from "./validators/zone.validator.js";
import { validateShippingQuoteInput } from "./validators/shippingQuote.validator.js";
import { createCourierService } from "./services/createCourier.service.js";
import { getCouriersService } from "./services/getCouriers.service.js";
import { createShippingZoneService } from "./services/createShippingZone.service.js";
import { getShippingZonesService } from "./services/getShippingZones.service.js";
import { calculateShippingService } from "./services/calculateShipping.service.js";

export const createCourier = async (req, res, next) => {
  try {
    const cleanData = validateCreateCourier(req.body);
    const result = await createCourierService(req.merchantId, cleanData);
    return sendResponse(
      res,
      201,
      "Courier provider added and encrypted.",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const getCouriers = async (req, res, next) => {
  try {
    const list = await getCouriersService(req.merchantId);
    return sendResponse(res, 200, "Couriers fetched successfully.", list);
  } catch (error) {
    next(error);
  }
};

export const createZone = async (req, res, next) => {
  try {
    const cleanData = validateCreateZone(req.body);
    const zone = await createShippingZoneService(req.merchantId, cleanData);
    return sendResponse(res, 201, "Shipping zone created successfully.", zone);
  } catch (error) {
    next(error);
  }
};

export const getZones = async (req, res, next) => {
  try {
    const zones = await getShippingZonesService(req.merchantId);
    return sendResponse(
      res,
      200,
      "Shipping zones fetched successfully.",
      zones,
    );
  } catch (error) {
    next(error);
  }
};

export const calculateShipping = async (req, res, next) => {
  try {
    const cleanInput = validateShippingQuoteInput(req.body);
    const quote = await calculateShippingService(req.merchantId, cleanInput);
    return sendResponse(res, 200, "Shipping rate calculated.", quote);
  } catch (error) {
    next(error);
  }
};