import { AppError } from "../../../../core/errors/AppError.js";
import {
  normalizePhoneE164,
  normalizeEmailCanonical,
} from "../../../../utils/identityNormalizer.util.js";

const VALID_PROVIDERS = new Set([
  "google",
  "apple_cloud",
  "whatsapp_otp",
  "email_password",
]);
const cleanStr = (val, max = 150) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate WhatsApp OTP Request
export const validateWhatsappOtpRequest = (body) => {
  const phone = normalizePhoneE164(body?.phone);
  if (!phone) {
    throw new AppError(
      "Please provide a valid phone number (e.g., +923001234567).",
      400,
    );
  }
  const actorType = body?.actorType === "merchant" ? "merchant" : "customer";
  return { phone, actorType };
};

// Validate OmniAuth Input
export const validateOmniAuthInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid authentication payload.", 400);
  }

  const provider = VALID_PROVIDERS.has(body.provider) ? body.provider : null;
  if (!provider) {
    throw new AppError(
      "provider must be 'google', 'apple_cloud', 'whatsapp_otp', or 'email_password'.",
      400,
    );
  }

  const email = body.email ? normalizeEmailCanonical(body.email) : null;
  const phone = body.phone ? normalizePhoneE164(body.phone) : null;

  if (!email && !phone && !body.oauthToken) {
    throw new AppError(
      "At least a valid email, phone number, or OAuth token is required.",
      400,
    );
  }

  return {
    provider,
    email,
    phone,
    name: cleanStr(body.name, 150) || "Verified User",
    password: typeof body.password === "string" ? body.password : null,
    otpCode: body.otpCode ? cleanStr(String(body.otpCode), 10) : null,
    oauthToken: body.oauthToken ? String(body.oauthToken).trim() : null,
    storeName: body.storeName ? cleanStr(body.storeName, 150) : null,
    domainUrl: body.domainUrl
      ? cleanStr(body.domainUrl, 255).toLowerCase()
      : null,
  };
};