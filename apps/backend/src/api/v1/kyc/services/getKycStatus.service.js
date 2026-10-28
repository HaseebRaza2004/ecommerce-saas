import { eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";
import { decryptText, maskSensitiveString } from "../../../../utils/crypto.util.js";

const { merchantKyc } = schema;

// Get Merchant KYC Status Service: Fetch KYC Record with Stampede Guard Caching
export const getMerchantKycStatusService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "kyc:status",
    async () => {
      const rows = await db
        .select()
        .from(merchantKyc)
        .where(eq(merchantKyc.merchantId, merchantId))
        .limit(1);

      if (!rows[0]) {
        return { kyc_status: "unsubmitted", is_verified: false };
      }

      const record = rows[0];
      const plainId = decryptText(record.encryptedIdNumber);
      const plainIban = decryptText(record.encryptedIbanOrAccount);

      return {
        kyc_status: record.status,
        is_name_reconciled: record.isNameReconciled,
        cnic_exact_name: record.cnicExactName,
        bank_account_title: record.bankAccountTitle,
        bank_name: record.bankName,
        masked_id_number: maskSensitiveString(plainId, 4),
        masked_iban: maskSensitiveString(plainIban, 4),
        document_type: record.documentType,
        updated_at: record.updatedAt,
      };
    },
    1800,
  );
};