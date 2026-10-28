import { AppError } from "../../core/errors/AppError.js";
import { encryptText, decryptText } from "./aes.util.js";

// Encrypt JSON Object Vault
export const encryptJsonVault = (dataObject) => {
  const encryptedString = encryptText(JSON.stringify(dataObject));
  const [iv, authTag, ciphertext] = encryptedString.split(":");
  return { iv, authTag, ciphertext };
};

// Decrypt JSON Object Vault
export const decryptJsonVault = (vault) => {
  if (!vault?.iv || !vault?.authTag || !vault?.ciphertext) {
    throw new AppError("Invalid JSON vault structure.", 400);
  }
  const jsonString = decryptText(
    `${vault.iv}:${vault.authTag}:${vault.ciphertext}`,
  );
  return JSON.parse(jsonString);
};

// Mask Sensitive String (e.g., API Keys, Passwords)
export const maskSensitiveString = (str, visibleEndChars = 4) => {
  if (!str || str.length <= visibleEndChars) return "****";
  return "*".repeat(str.length - visibleEndChars) + str.slice(-visibleEndChars);
};