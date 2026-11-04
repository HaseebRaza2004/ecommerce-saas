import { sendResponse } from "../../utils/responseHandler.js";

// Global Error Handler Middleware
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  const pgCode = err.code || err.cause?.code;
  const pgConstraint = err.constraint || err.cause?.constraint || "";
  const rawDbMessage = (err.cause?.message || err.message || "").toLowerCase();

  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON payload in request body.";
  }

  if (pgCode === "23505") {
    statusCode = 409;
    if (pgConstraint.includes("bank_transaction_id")) {
      message =
        "Fraud Alert: This Bank/Raast Transaction ID (TID) has already been used.";
    } else if (pgConstraint.includes("idempotency_key")) {
      message = "Duplicate order request detected.";
    } else {
      message = "Duplicate record detected. This value already exists.";
    }
  }

  if (pgCode === "22P02") {
    statusCode = 400;
    if (rawDbMessage.includes("enum")) {
      message = `Invalid status or enum option provided in request: ${err.cause?.message || err.message}`;
    } else {
      message = "Invalid UUID identifier format provided.";
    }
  }

  if (statusCode === 500) {
    console.error("🔥 [CRITICAL SERVER ERROR]:", err);
    if (process.env.NODE_ENV === "production") {
      message = "Something went wrong on our end. Please try again later.";
    }
  }

  return sendResponse(res, statusCode, message, null);
};