import { sendResponse } from "../../utils/responseHandler.js";

/**
 * 🛡️ CENTRALIZED ENTERPRISE ERROR HANDLER (Supports Drizzle ORM err.cause Unwrapping)
 */
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // Extract PostgreSQL error code & constraint from either top-level or Drizzle's err.cause
  const pgCode = err.code || err.cause?.code;
  const pgConstraint = err.constraint || err.cause?.constraint || "";

  // 1. Handle Malformed JSON Body
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON payload in request body.";
  }

  // 2. Handle PostgreSQL Unique Constraint Violation (23505) Cleanly (No Console Dump!)
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

  // 3. Handle PostgreSQL Invalid UUID Format (22P02)
  if (pgCode === "22P02") {
    statusCode = 400;
    message = "Invalid identifier format provided.";
  }

  // 4. Only log real unexpected 500 server crashes
  if (statusCode === 500) {
    console.error("🔥 [CRITICAL SERVER ERROR]:", err);
    if (process.env.NODE_ENV === "production") {
      message = "Something went wrong on our end. Please try again later.";
    }
  }

  return sendResponse(res, statusCode, message, null);
};