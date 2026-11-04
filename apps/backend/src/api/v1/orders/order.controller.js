import { sendResponse } from "../../../utils/responseHandler.js";
import { validatePlaceOrderInput } from "./validators/placeOrder.validator.js";
import { validateDeliveryUnlockInput } from "./validators/deliveryUnlock.validator.js";
import { placeOrderService } from "./services/placeOrder.service.js";
import {
  getMerchantOrdersService,
  trackOrderPublicService,
} from "./services/getOrders.service.js";
import { verifyOrderDeliveryService } from "./services/verifyDelivery.service.js";
import { validateUpdateOrderStatus } from "./validators/orderStatus.validator.js";
import { updateOrderStatusService } from "./services/updateOrderStatus.service.js";

export const placeOrder = async (req, res, next) => {
  try {
    const cleanData = validatePlaceOrderInput(req.body);
    const result = await placeOrderService(req.merchantId, cleanData);
    return sendResponse(
      res,
      201,
      "Order placed and inventory locked successfully.",
      result,
    );
  } catch (error) {
    next(error);
  }
};

export const trackOrderPublic = async (req, res, next) => {
  try {
    const { orderNumber, phone } = req.query;
    const result = await trackOrderPublicService(
      req.merchantId,
      orderNumber,
      phone,
    );
    return sendResponse(res, 200, "Order tracking details fetched.", result);
  } catch (error) {
    next(error);
  }
};

export const getMerchantOrders = async (req, res, next) => {
  try {
    const list = await getMerchantOrdersService(req.merchantId);
    return sendResponse(res, 200, "Store orders fetched successfully.", list);
  } catch (error) {
    next(error);
  }
};

export const verifyOrderDelivery = async (req, res, next) => {
  try {
    const cleanInput = validateDeliveryUnlockInput(req.params.id, req.body);
    const updated = await verifyOrderDeliveryService(
      req.merchantId,
      cleanInput,
    );
    return sendResponse(
      res,
      200,
      "Delivery handshake verified. Order marked as Delivered.",
      updated,
    );
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const cleanData = validateUpdateOrderStatus(req.params.id, req.body);
    const updated = await updateOrderStatusService(req.merchantId, cleanData);
    return sendResponse(
      res,
      200,
      "Order status updated successfully.",
      updated,
    );
  } catch (error) {
    next(error);
  }
};