import { AppError } from "../../../../core/errors/AppError.js";

const cleanStr = (val, max = 300) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

const cleanLongText = (val, max = 15000) =>
  typeof val === "string"
    ? val
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .trim()
        .slice(0, max)
    : "";

// Validate Legal Policies, FAQs & contactDetails JSONB
export const validateStorePoliciesInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid store policies payload.", 400);
  }

  const faqs = Array.isArray(body.faqs)
    ? body.faqs
        .slice(0, 30)
        .map((f) => ({
          question: cleanStr(f?.question, 300),
          answer: cleanStr(f?.answer, 1000),
        }))
        .filter((f) => f.question && f.answer)
    : [];

  const rawContact = body.contactDetails || {};
  const rawSocial = rawContact.socialLinks || body.socialLinks || {};

  const contactDetails = {
    email: cleanStr(rawContact.email, 150),
    phone: cleanStr(rawContact.phone, 50),
    whatsapp: cleanStr(rawContact.whatsapp || rawSocial.whatsapp, 50),
    address: cleanStr(rawContact.address, 300),
    workingHours: cleanStr(
      rawContact.workingHours || "Mon-Sat: 9AM - 9PM",
      100,
    ),
    socialLinks: {
      instagram: cleanStr(rawSocial.instagram, 255),
      facebook: cleanStr(rawSocial.facebook, 255),
      tiktok: cleanStr(rawSocial.tiktok, 255),
      youtube: cleanStr(rawSocial.youtube, 255),
    },
  };

  return {
    privacyPolicy: cleanLongText(
      body.privacyPolicy || "Default Privacy Policy...",
    ),
    termsOfService: cleanLongText(
      body.termsOfService || "Default Terms of Service...",
    ),
    refundPolicy: cleanLongText(
      body.refundPolicy || "Default Refund & Return Policy...",
    ),
    shippingPolicy: cleanLongText(
      body.shippingPolicy || "Default Shipping Policy...",
    ),
    faqs,
    contactDetails,
  };
};