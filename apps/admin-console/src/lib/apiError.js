const FALLBACK_MESSAGES = Object.freeze({
  400: "Please check your submitted details and try again.",
  401: "Your session expired. Please sign in again.",
  403: "You do not have permission to perform this action.",
  404: "The requested record was not found.",
  409: "This record already exists. Please use a different value.",
  413: "The uploaded file is too large.",
  422: "Some fields failed validation. Please review and try again.",
  429: "Too many attempts. Please wait a few minutes and try again.",
  500: "Something went wrong on the server. Please try again shortly.",
  503: "Server is currently unavailable. Please check your connection.",
});

export class ApiError extends Error {
  constructor(message, status = 500, data = null) {
    super(message || FALLBACK_MESSAGES[status] || "Unexpected request error.");
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export function normalizeApiError(status, payload) {
  const serverMsg =
    typeof payload?.message === "string" ? payload.message.trim() : "";
  const message = serverMsg || FALLBACK_MESSAGES[status] || "Request failed.";
  return new ApiError(message, status, payload?.data ?? null);
}