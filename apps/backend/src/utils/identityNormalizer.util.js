//  Normalize Phone Number to E.164 Format
export const normalizePhoneE164 = (rawPhone, defaultDialCode = "92") => {
  if (!rawPhone || typeof rawPhone !== "string") return null;

  let digits = rawPhone.replace(/[^\d+]/g, "");
  if (!digits) return null;

  if (digits.startsWith("00")) {
    digits = "+" + digits.slice(2);
  } else if (digits.startsWith("0") && digits.length === 11) {
    // Local format e.g. 03001234567 -> +923001234567
    digits = `+${defaultDialCode}${digits.slice(1)}`;
  } else if (!digits.startsWith("+")) {
    digits = `+${digits}`;
  }

  return digits.length >= 8 && digits.length <= 16 ? digits : null;
};

// Normalize Email to Canonical Form
export const normalizeEmailCanonical = (rawEmail) => {
  if (!rawEmail || typeof rawEmail !== "string") return null;

  const clean = rawEmail.toLowerCase().trim();
  const parts = clean.split("@");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return null;

  let [local, domain] = parts;
  if (domain === "gmail.com" || domain === "googlemail.com") {
    local = local.split("+")[0].replace(/\./g, "");
    domain = "gmail.com";
  }

  return `${local}@${domain}`;
};