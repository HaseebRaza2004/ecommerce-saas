import { AppError } from "../../../../core/errors/AppError.js";
import { stripXss, validateLoginInput } from "./login.validator.js";

// Blocks localhost and private internal IPs (SSRF Protection)
const DOMAIN_REGEX =
  /^(?!localhost|127\.|10\.|192\.168\.|169\.254\.)([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/;

// Validate Registration Input: Store Name, Domain URL, Email, Password, Phone
export const validateRegisterInput = (body) => {
  const { email, password } = validateLoginInput(body);
  const { storeName, domainUrl, phone } = body;

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

  const cleanPhone =
    phone && typeof phone === "string" ? stripXss(phone).slice(0, 50) : null;

  return {
    storeName: cleanStoreName,
    domainUrl: cleanDomain,
    email,
    password,
    phone: cleanPhone,
  };
};