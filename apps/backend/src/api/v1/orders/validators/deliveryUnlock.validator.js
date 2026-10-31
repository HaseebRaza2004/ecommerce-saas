import { AppError } from "../../../../core/errors/AppError.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const cleanStr = (val, max = 150) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Anti-Scam Delivery PIN / QR Verification Payload
export const validateDeliveryUnlockInput = (orderId, body) => {
  if (!orderId || !UUID_REGEX.test(orderId)) {
    throw new AppError("Invalid order ID format.", 400);
  }

  if (!body || typeof body !== "object") {
    throw new AppError("Verification payload is required.", 400);
  }

  const secretPin = body.secretPin ? cleanStr(body.secretPin, 10) : null;
  const qrToken = body.qrToken ? cleanStr(body.qrToken, 255) : null;

  if (!secretPin && !qrToken) {
    throw new AppError(
      "Customer 6-digit Secret PIN or Delivery QR Token is required to mark order Delivered.",
      400,
    );
  }

  return { orderId, secretPin, qrToken };
};