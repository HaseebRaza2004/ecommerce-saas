import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKETS } from "../../../../config/r2.client.js";

// Generates a presigned upload URL for direct frontend-to-R2 uploads, enforcing strict tenant isolation and MIME type validation.
export const generatePresignedUploadService = async (
  merchantId,
  validatedData,
) => {
  const { category, mimeType, fileSizeBytes, extension, bucketType } =
    validatedData;

  const isPrivate = bucketType === "PRIVATE_KYC";
  const targetBucket = isPrivate ? R2_BUCKETS.PRIVATE_KYC : R2_BUCKETS.PUBLIC;

  // Strict Tenant Isolation Path: tenants/{merchantId}/{category}/{uuid}.{ext}
  const uniqueFileId = crypto.randomUUID();
  const objectKey = `tenants/${merchantId}/${category}/${uniqueFileId}.${extension}`;

  const command = new PutObjectCommand({
    Bucket: targetBucket,
    Key: objectKey,
    ContentType: mimeType,
    ContentLength: fileSizeBytes, // Locks exact byte size into cryptographic signature
  });

  // 120 seconds expiry for direct frontend-to-R2 PUT upload
  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 120 });

  // Blueprint Q34: Public assets return Cloudflare Edge Image Resizing / CDN URL
  const fileUrl = isPrivate
    ? `https://r2.private.vault/${objectKey}`
    : `${R2_BUCKETS.CDN_URL}/${objectKey}`;

  return {
    upload_url: uploadUrl,
    file_url: fileUrl,
    object_key: objectKey,
    bucket_visibility: isPrivate ? "private_vault" : "public_cdn",
    expires_in_seconds: 120,
  };
};