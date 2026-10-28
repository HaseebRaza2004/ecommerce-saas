/*
 temperory request logger middleware for debugging purposes
 Request Logger Middleware 
 */

import { randomUUID } from "node:crypto";

export function requestLogger(req, res, next) {
  const start = process.hrtime.bigint();
  const requestId = randomUUID();
  let logged = false;

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