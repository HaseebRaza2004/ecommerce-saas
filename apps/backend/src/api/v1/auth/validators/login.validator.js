import { AppError } from "../../../../core/errors/AppError.js";
import {
  normalizeEmailCanonical,
  normalizePhoneE164,
} from "../../../../utils/identityNormalizer.util.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * 🛡️ Validate Unified Admin Console Login (Accepts Email OR Phone + Password)
 */
export const validateLoginInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid login request payload.", 400);
  }

  const rawId = String(
    body.identifier || body.email || body.phone || "",
  ).trim();
  const password = typeof body.password === "string" ? body.password : "";

  if (!rawId || password.length < 6 || password.length > 128) {
    throw new AppError("Valid email/phone and password are required.", 400);
  }

  const isEmailInput = rawId.includes("@");
  const email = isEmailInput ? normalizeEmailCanonical(rawId) : null;
  const phone = !isEmailInput ? normalizePhoneE164(rawId) : null;

  if (!email && !phone) {
    throw new AppError(
      "Please enter a valid email address or phone number.",
      400,
    );
  }

  let merchantId = null;
  if (body.merchantId) {
    if (
      typeof body.merchantId !== "string" ||
      !UUID_REGEX.test(body.merchantId)
    ) {
      throw new AppError("Invalid merchantId UUID format.", 400);
    }
    merchantId = body.merchantId;
  }

  return { email, phone, identifier: email || phone, password, merchantId };
};