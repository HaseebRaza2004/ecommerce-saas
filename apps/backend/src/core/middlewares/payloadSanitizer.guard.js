import { AppError } from "../errors/AppError.js";

const FORBIDDEN_KEYS = new Set(["__proto__", "constructor", "prototype"]);

// Deep Recursive Object Sanitizer (Blocks Prototype Pollution, Null-Bytes & $ Injection)
const sanitizeObject = (obj, depth = 0) => {
  if (depth > 8 || !obj || typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item, depth + 1));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    if (FORBIDDEN_KEYS.has(key) || key.startsWith("$") || key.includes("\0")) {
      throw new AppError(
        `Security Violation: Forbidden payload key '${key}' detected.`,
        400,
      );
    }

    if (typeof value === "string") {
      cleaned[key] = value.replace(/\0/g, "");
    } else if (typeof value === "object" && value !== null) {
      cleaned[key] = sanitizeObject(value, depth + 1);
    } else {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

// Middleware to sanitize request payloads (body, query, params)
export const payloadSanitizerGuard = (req, res, next) => {
  try {
    if (req.body && typeof req.body === "object") {
      req.body = sanitizeObject(req.body);
    }
    if (req.query && typeof req.query === "object") {
      const cleanQuery = sanitizeObject(req.query);
      Object.defineProperty(req, "query", {
        value: cleanQuery,
        writable: true,
        configurable: true,
      });
    }
    if (req.params && typeof req.params === "object") {
      req.params = sanitizeObject(req.params);
    }
    next();
  } catch (error) {
    next(error);
  }
};