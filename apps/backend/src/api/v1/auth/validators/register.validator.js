import { AppError } from "../../../../core/errors/AppError.js";
import {
  normalizeEmailCanonical,
  normalizePhoneE164,
} from "../../../../utils/identityNormalizer.util.js";

// Blocks localhost and private internal IPs (SSRF Protection)
const DOMAIN_REGEX =
  /^(?!localhost|127\.|10\.|192\.168\.|169\.254\.)([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;

// Sanitize Input to Prevent XSS Attacks
export const stripXss = (str) => {
  return str.replace(/[<>'"`;(){}]/g, "").trim();
};

// Validate Registration Input: Store Name, Domain URL, Email, Password, Phone
export const validateRegisterInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Malformed request payload.", 400);
  }

  const { storeName, domainUrl, email, password, phone } = body;

  if (typeof email !== "string" || typeof password !== "string") {
    throw new AppError("Email and password must be valid strings.", 400);
  }

  const cleanEmail = normalizeEmailCanonical(email);
  if (!cleanEmail || cleanEmail.length > 255) {
    throw new AppError("Please provide a valid email address.", 400);
  }

  if (password.length < 6 || password.length > 128) {
    throw new AppError("Password must be between 6 and 128 characters.", 400);
  }

  if (typeof storeName !== "string" || typeof domainUrl !== "string") {
    throw new AppError("Store name and domain URL must be valid strings.", 400);
  }

  const cleanStoreName = stripXss(storeName);
  if (cleanStoreName.length < 2 || cleanStoreName.length > 150) {
    throw new AppError("Store name must be between 2 and 150 characters.", 400);
  }

  const cleanDomain = domainUrl.toLowerCase().trim();
  if (!DOMAIN_REGEX.test(cleanDomain) || cleanDomain.length > 255) {
    throw new AppError("Invalid or restricted domain URL format.", 400);
  }

  let cleanPhone = null;
  if (phone && typeof phone === "string" && phone.trim() !== "") {
    cleanPhone = normalizePhoneE164(phone);
    if (!cleanPhone) {
      throw new AppError("Please provide a valid phone number.", 400);
    }
  }

  return {
    storeName: cleanStoreName,
    domainUrl: cleanDomain,
    email: cleanEmail,
    password,
    phone: cleanPhone,
  };
};
