import { AppError } from "../../../../core/errors/AppError.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_ORDER_STATUSES = new Set([
  "pending_payment",
  "pending_verification",
  "processing",
  "dispatched",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
]);
const VALID_PAYMENT_STATUSES = new Set([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

const cleanStr = (val, max = 200) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate order status update payload
export const validateUpdateOrderStatus = (orderId, body) => {
  if (!orderId || !UUID_REGEX.test(orderId)) {
    throw new AppError("Invalid order ID format.", 400);
  }
  if (!body || typeof body !== "object") {
    throw new AppError("Order update payload is required.", 400);
  }

  const orderStatus = body.orderStatus ? cleanStr(body.orderStatus, 50) : null;
  if (!orderStatus || !VALID_ORDER_STATUSES.has(orderStatus)) {
    throw new AppError("Invalid orderStatus value provided.", 400);
  }

  let paymentStatus = null;
  if (body.paymentStatus) {
    if (!VALID_PAYMENT_STATUSES.has(body.paymentStatus)) {
      throw new AppError("Invalid paymentStatus value provided.", 400);
    }
    paymentStatus = body.paymentStatus;
  }

  const trackingNumber = body.trackingNumber
    ? cleanStr(body.trackingNumber, 150)
    : undefined;
  const shippingLabelUrl =
    typeof body.shippingLabelUrl === "string" &&
    body.shippingLabelUrl.startsWith("https://")
      ? body.shippingLabelUrl.trim()
      : undefined;

  return {
    orderId,
    orderStatus,
    paymentStatus,
    trackingNumber,
    shippingLabelUrl,
  };
};