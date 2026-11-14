const DANGEROUS_KEYS = new Set(["__proto__", "constructor", "prototype"]);

export const sanitizePayload = (input) => {
  if (typeof input === "string") {
    return input
      .replace(/\0/g, "")
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .trim();
  }
  if (Array.isArray(input)) {
    return input.map(sanitizePayload);
  }
  if (input && typeof input === "object") {
    const clean = {};
    for (const [key, val] of Object.entries(input)) {
      if (!DANGEROUS_KEYS.has(key) && !key.startsWith("$")) {
        clean[key] = sanitizePayload(val);
      }
    }
    return clean;
  }
  return input;
};

export const validateEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(email || "").trim());

export const validateDomain = (domain) =>
  /^[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,10}$/i.test(
    String(domain || "").trim(),
  );

export const validatePhone = (phone) =>
  /^(\+?[0-9]{10,15}|03[0-9]{2}-?[0-9]{7})$/.test(String(phone || "").trim());

export const validatePassword = (password) =>
  typeof password === "string" && password.length >= 8;

export const validateOtp = (otp) => /^[0-9]{6}$/.test(String(otp || "").trim());