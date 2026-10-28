import crypto from "crypto";
import { AppError } from "../../core/errors/AppError.js";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;

const MASTER_KEY = crypto
  .createHash("sha256")
  .update(
    process.env.ENCRYPTION_MASTER_KEY ||
      process.env.JWT_SECRET ||
      "fallback_vault_key_2026",
  )
  .digest();

// Encrypt Plaintext String using AES-256-GCM ("ivHex:authTagHex:ciphertextHex")
export const encryptText = (plainText) => {
  if (!plainText || typeof plainText !== "string") {
    throw new AppError("Encryption failed: Invalid plaintext input.", 400);
  }

  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv);

  let encrypted = cipher.update(plainText, "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
};

// Decrypt & Verify GCM AuthTag (Blocks Tampered Ciphertext)
export const decryptText = (encryptedPayload) => {
  try {
    const parts = String(encryptedPayload).split(":");
    if (parts.length !== 3) throw new Error("Malformed structure");

    const [ivHex, authTagHex, ciphertextHex] = parts;
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      MASTER_KEY,
      Buffer.from(ivHex, "hex"),
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (error) {
    throw new AppError(
      "Security Alert: Encrypted data integrity check failed.",
      500,
    );
  }
};