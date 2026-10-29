import { sendResponse } from "../../utils/responseHandler.js";

// Global Error Handler Middleware for Express
export const globalErrorHandler = (err, req, res, next) => {
  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // 1. Handle Malformed JSON Body (Express body-parser error)
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Malformed JSON payload in request body.";
  }

  // 2. Handle PostgreSQL Unique Constraint Violation (e.g., Duplicate Email, Domain, or Bank TID)
  if (err.code === "23505") {
    statusCode = 409;
    message = "Duplicate record detected. This value already exists.";
  }

  // 3. Handle PostgreSQL Invalid UUID Format (Prevents SQL crash on tampered IDs)
  if (err.code === "22P02") {
    statusCode = 400;
    message = "Invalid identifier format provided.";
  }

  // 4. Mask Unexpected 500 Programming/DB Errors in Production
  if (statusCode === 500) {
    console.error("🔥 [CRITICAL SERVER ERROR]:", err);
    if (process.env.NODE_ENV === "production") {
      message = "Something went wrong on our end. Please try again later.";
    }
  }

  return sendResponse(res, statusCode, message, null);
};