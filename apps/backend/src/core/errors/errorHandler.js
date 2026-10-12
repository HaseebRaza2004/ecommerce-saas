import { sendResponse } from "../../utils/responseHandler.js";

export const globalErrorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";

  if (process.env.NODE_ENV === "development") {
    console.error("🚨 System Error Log:", err);
  }

  return sendResponse(res, status, message);
};