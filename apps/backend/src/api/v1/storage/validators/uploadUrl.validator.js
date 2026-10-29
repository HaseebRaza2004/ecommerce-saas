import { AppError } from "../../../../core/errors/AppError.js";

// Strict Allowlist: Blocks .svg (XSS risk), .exe, .php, .js, and shell scripts
const UPLOAD_RULES = {
  product_image: {
    bucketType: "PUBLIC",
    maxBytes: 5 * 1024 * 1024, 
    allowedMimes: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    },
  },
  store_asset: {
    bucketType: "PUBLIC",
    maxBytes: 3 * 1024 * 1024, 
    allowedMimes: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    },
  },
  kyc_document: {
    bucketType: "PRIVATE_KYC",
    maxBytes: 5 * 1024 * 1024, 
    allowedMimes: {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
    },
  },
  kyc_video: {
    bucketType: "PRIVATE_KYC",
    maxBytes: 15 * 1024 * 1024,
    allowedMimes: { "video/webm": "webm", "video/mp4": "mp4" },
  },
};

export const validateUploadRequest = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid upload request payload.", 400);
  }

  const { category, mimeType, fileSizeBytes } = body;
  const rule = UPLOAD_RULES[category];

  if (!rule) {
    throw new AppError("Invalid upload category specified.", 400);
  }

  const extension = rule.allowedMimes[mimeType];
  if (!extension) {
    throw new AppError(
      `Unsupported or unsafe file MIME type (${mimeType}).`,
      415,
    );
  }

  const size = Number(fileSizeBytes);
  if (!Number.isInteger(size) || size <= 0 || size > rule.maxBytes) {
    throw new AppError(
      `File size exceeds maximum allowed limit of ${rule.maxBytes / (1024 * 1024)}MB.`,
      413,
    );
  }

  return {
    category,
    mimeType,
    fileSizeBytes: size,
    extension,
    bucketType: rule.bucketType,
  };
};