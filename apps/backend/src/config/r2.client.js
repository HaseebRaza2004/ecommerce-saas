import { S3Client } from "@aws-sdk/client-s3";
import "./env.js";

// R2 Configuration

const accountId = process.env.R2_ACCOUNT_ID || "local_dev_account";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "dev_access_key",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "dev_secret_key",
  },
});

export const R2_BUCKETS = {
  PUBLIC: process.env.R2_PUBLIC_BUCKET || "saas-public-assets",
  PRIVATE_KYC: process.env.R2_PRIVATE_KYC_BUCKET || "saas-private-kyc-vault",
  CDN_URL: process.env.R2_PUBLIC_CDN_URL || "https://cdn.yoursaas.com",
};