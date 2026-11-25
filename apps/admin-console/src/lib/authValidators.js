const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const DOMAIN_RE = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9-]+)+$/;
const PHONE_RE = /^\+?[0-9\s-]{10,16}$/;
const OTP_RE = /^[0-9]{6}$/;

export function sanitizeDomain(raw) {
  return String(raw || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");
}

export function getPasswordStrength(password) {
  const val = String(password || "");
  let score = 0;
  if (val.length >= 8) score += 1;
  if (/[A-Z]/.test(val) && /[a-z]/.test(val)) score += 1;
  if (/[0-9]/.test(val)) score += 1;
  if (/[^A-Za-z0-9]/.test(val) || val.length >= 12) score += 1;
  const labels = ["Weak", "Fair", "Good", "Strong"];
  return { score, label: labels[Math.max(0, score - 1)] || "Too short" };
}

export function validateLoginForm({ identifier, password }) {
  const errors = {};
  const cleanId = String(identifier || "").trim();
  if (!EMAIL_RE.test(cleanId) && !PHONE_RE.test(cleanId)) {
    errors.identifier = "Enter a valid email address or phone number.";
  }
  if (String(password || "").length < 6) {
    errors.password = "Password must be at least 6 characters.";
  }
  return errors;
}

export function validateRegisterForm(values) {
  const errors = {};
  if (String(values.storeName || "").trim().length < 2) {
    errors.storeName = "Store name must be at least 2 characters.";
  }
  if (!DOMAIN_RE.test(sanitizeDomain(values.domainUrl))) {
    errors.domainUrl = "Use a valid domain like mystore.pk or shop.com.";
  }
  if (!EMAIL_RE.test(String(values.email || "").trim())) {
    errors.email = "Enter a valid business email address.";
  }
  if (!PHONE_RE.test(String(values.phone || "").trim())) {
    errors.phone = "Enter a valid phone number (e.g., +923001234567).";
  }
  if (!values.country) {
    errors.country = "Select your country.";
  }
  const strength = getPasswordStrength(values.password);
  if (String(values.password || "").length < 8 || strength.score < 2) {
    errors.password = "Use 8+ chars with uppercase, lowercase, and a number.";
  }
  return errors;
}

export function validateWhatsappStep({ phone, otpCode, otpSent }) {
  const errors = {};
  if (!PHONE_RE.test(String(phone || "").trim())) {
    errors.phone = "Enter a valid WhatsApp number (e.g., +923001234567).";
  }
  if (otpSent && !OTP_RE.test(String(otpCode || "").trim())) {
    errors.otpCode = "Enter the 6-digit verification code.";
  }
  return errors;
};