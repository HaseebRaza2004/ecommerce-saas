import { AppError } from "../../../../core/errors/AppError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Sanitize Input to Prevent XSS Attacks
export const stripXss = (str) => {
  return str.replace(/[<>'"`;(){}]/g, "").trim();
};

// Validate Login Input: Email & Password
export const validateLoginInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Malformed request payload.", 400);
  }

  const { email, password } = body;
  if (typeof email !== "string" || typeof password !== "string") {
    throw new AppError("Email and password must be valid strings.", 400);
  }

  const cleanEmail = email.toLowerCase().trim();
  if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 255) {
    throw new AppError("Please provide a valid email address.", 400);
  }

  if (password.length < 6 || password.length > 128) {
    throw new AppError("Password must be between 6 and 128 characters.", 400);
  }

  return { email: cleanEmail, password };
};