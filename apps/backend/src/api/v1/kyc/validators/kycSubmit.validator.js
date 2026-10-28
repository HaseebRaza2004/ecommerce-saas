import { AppError } from "../../../../core/errors/AppError.js";
import { cleanKycString, validateHardwareCamera } from "./camera.validator.js";

const VALID_DOC_TYPES = new Set([
  "cnic",
  "national_id",
  "passport",
  "driving_license",
]);

// Validate KYC Submission Payload for Backend Processing
export const validateKycSubmission = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid KYC request payload.", 400);
  }

  const cnicExactName = cleanKycString(body.cnicExactName, 150);
  const bankAccountTitle = cleanKycString(body.bankAccountTitle, 150);
  const bankName = cleanKycString(body.bankName, 100);
  const ibanOrAccount = cleanKycString(body.ibanOrAccount, 60)
    .replace(/\s+/g, "")
    .toUpperCase();
  const idNumber = cleanKycString(body.idNumber, 40).replace(/[-\s]/g, "");
  const spokenChallengeCode = cleanKycString(body.spokenChallengeCode, 10);
  const deviceFingerprint = cleanKycString(body.deviceFingerprint, 255);

  if (!cnicExactName || !bankAccountTitle || !bankName) {
    throw new AppError(
      "CNIC Full Name, Bank Account Title, and Bank Name are required.",
      400,
    );
  }
  if (idNumber.length < 7 || idNumber.length > 25) {
    throw new AppError("Invalid Government ID / CNIC number format.", 400);
  }
  if (ibanOrAccount.length < 8 || ibanOrAccount.length > 34) {
    throw new AppError("Invalid IBAN or Bank Account number.", 400);
  }
  if (!/^\d{4}$/.test(spokenChallengeCode)) {
    throw new AppError("Invalid 4-digit spoken challenge code.", 400);
  }
  if (!deviceFingerprint || deviceFingerprint.length < 8) {
    throw new AppError("Device fingerprint is required.", 400);
  }

  const urls = [
    body.colorFlashVideoUrl,
    body.documentFrontUrl,
    body.documentBackUrl,
  ];
  for (const url of urls) {
    if (
      typeof url !== "string" ||
      !url.startsWith("https://") ||
      url.length > 500
    ) {
      throw new AppError(
        "All verification media must be valid HTTPS Private R2 URLs.",
        400,
      );
    }
  }

  return {
    cnicExactName,
    bankAccountTitle,
    bankName,
    ibanOrAccount,
    country: cleanKycString(body.country || "PK", 100),
    documentType: VALID_DOC_TYPES.has(body.documentType)
      ? body.documentType
      : "cnic",
    idNumber,
    spokenChallengeCode,
    colorFlashVideoUrl: body.colorFlashVideoUrl.trim(),
    documentFrontUrl: body.documentFrontUrl.trim(),
    documentBackUrl: body.documentBackUrl.trim(),
    cameraHardwareMeta: validateHardwareCamera(body.cameraHardwareMeta),
    deviceFingerprint,
    registeredBusinessName: body.registeredBusinessName
      ? cleanKycString(body.registeredBusinessName, 200)
      : null,
    taxRegistrationNumber: body.taxRegistrationNumber
      ? cleanKycString(body.taxRegistrationNumber, 100)
      : null,
    qrSessionToken: body.qrSessionToken
      ? cleanKycString(body.qrSessionToken, 100)
      : null,
  };
};