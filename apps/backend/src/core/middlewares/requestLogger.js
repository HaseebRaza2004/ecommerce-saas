/**
 * Request Logger Middleware
 * Logs API request duration, status, and unique request ID.
 * Useful for debugging and performance monitoring.
 */

import { randomUUID } from "node:crypto";

export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const requestId = randomUUID();
  let logged = false;

  // Attach the unique ID to the response headers.
  res.setHeader("X-Request-Id", requestId);

  // Make the ID available to downstream middleware and routes.
  req.requestId = requestId;

  const logRequest = (event) => {
    if (logged) return;
    logged = true;

    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;

    console.log(
      `[API] ${req.method} ${req.originalUrl} | ` +
        `Status: ${res.statusCode} | ` +
        `Time: ${durationMs.toFixed(2)} ms | ` +
        `Request ID: ${requestId} | ` +
        `Event: ${event}`,
    );
  };

  res.on("finish", () => logRequest("completed"));
  res.on("close", () => logRequest("closed"));

  next();
}