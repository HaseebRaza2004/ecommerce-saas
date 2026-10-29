import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKETS } from "../../../../config/r2.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

// Generates a presigned read URL for private KYC assets, enforcing strict tenant isolation and access control.
export const generatePrivateReadUrlService = async (merchantId, objectKey) => {
  if (!objectKey || typeof objectKey !== "string") {
    throw new AppError("Object key is required.", 400);
  }

  // IDOR Shield: Merchant can only view files inside their own tenant folder
  const expectedPrefix = `tenants/${merchantId}/`;
  if (!objectKey.startsWith(expectedPrefix) || objectKey.includes("..")) {
    throw new AppError("Access denied: Unauthorized storage path.", 403);
  }

  const command = new GetObjectCommand({
    Bucket: R2_BUCKETS.PRIVATE_KYC,
    Key: objectKey,
  });

  const signedReadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 60,
  });

  return {
    signed_read_url: signedReadUrl,
    expires_in_seconds: 60,
  };
};