import { db, schema } from "../../../../config/db.client.js";
import { redisClient } from "../../../../config/redis.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";
import { encryptText, maskSensitiveString } from "../../../../utils/crypto.util.js";
import { reconcileKycNames } from "../../../../utils/nameNormalizer.util.js";

const { merchantKyc } = schema;

// Submit Merchant KYC Service: Validate Challenge, Reconcile Names, Encrypt Sensitive Data, and Store KYC Record
export const submitMerchantKycService = async (
  merchantId,
  data,
  submissionIp,
) => {
  const activeChallenge = await redisClient.get(
    `verify:challenge:${merchantId}`,
  );
  if (!activeChallenge || activeChallenge !== data.spokenChallengeCode) {
    throw new AppError(
      "Spoken 4-digit challenge code expired or mismatched.",
      400,
    );
  }

  const nameResult = reconcileKycNames(
    data.cnicExactName,
    data.bankAccountTitle,
  );
  if (!nameResult.overlapPassed) {
    throw new AppError(
      "KYC Rejected: Bank Account Title does not match CNIC Name. Third-party accounts are prohibited.",
      422,
    );
  }

  const kycRecord = {
    merchantId,
    cnicExactName: data.cnicExactName,
    bankAccountTitle: data.bankAccountTitle,
    bankName: data.bankName,
    encryptedIbanOrAccount: encryptText(data.ibanOrAccount),
    normalizedNameTokens: {
      cnicTokens: nameResult.cnicTokens,
      bankTokens: nameResult.bankTokens,
      overlapScore: nameResult.overlapScore,
      overlapPassed: nameResult.overlapPassed,
    },
    isNameReconciled: true,
    country: data.country,
    documentType: data.documentType,
    encryptedIdNumber: encryptText(data.idNumber),
    spokenChallengeCode: data.spokenChallengeCode,
    colorFlashVideoUrl: data.colorFlashVideoUrl,
    documentFrontUrl: data.documentFrontUrl,
    documentBackUrl: data.documentBackUrl,
    cameraHardwareMeta: data.cameraHardwareMeta,
    deviceFingerprint: data.deviceFingerprint,
    submissionIp,
    registeredBusinessName: data.registeredBusinessName,
    taxRegistrationNumber: data.taxRegistrationNumber,
    status: "pending_review",
    rejectionReason: null,
    updatedAt: new Date(),
  };

  await db
    .insert(merchantKyc)
    .values(kycRecord)
    .onConflictDoUpdate({ target: merchantKyc.merchantId, set: kycRecord });

  if (data.qrSessionToken) {
    await redisClient.set(
      `verify:session:${data.qrSessionToken}`,
      JSON.stringify({
        merchantId,
        spokenChallengeCode: data.spokenChallengeCode,
        status: "COMPLETED",
      }),
      "EX",
      120,
    );
  }

  await redisClient.del(`verify:challenge:${merchantId}`);
  await invalidateTenantCache(merchantId);

  return {
    kyc_status: "pending_review",
    is_name_reconciled: true,
    name_overlap_score: nameResult.overlapScore,
    masked_id: maskSensitiveString(data.idNumber, 4),
    masked_iban: maskSensitiveString(data.ibanOrAccount, 4),
  };
};