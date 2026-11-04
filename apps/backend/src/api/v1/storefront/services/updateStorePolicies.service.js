import { db, schema } from "../../../../config/db.client.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { storePolicies } = schema;

// Update Storefront Legal Policies, FAQs, and Contact Details for a given merchantId
export const updateStorePoliciesService = async (merchantId, data) => {
  const record = {
    merchantId,
    privacyPolicy: data.privacyPolicy,
    termsOfService: data.termsOfService,
    refundPolicy: data.refundPolicy,
    shippingPolicy: data.shippingPolicy,
    faqs: data.faqs,
    contactDetails: data.contactDetails,
    updatedAt: new Date(),
  };

  const [saved] = await db
    .insert(storePolicies)
    .values(record)
    .onConflictDoUpdate({
      target: storePolicies.merchantId,
      set: record,
    })
    .returning();

  await invalidateTenantCache(merchantId);
  return saved;
};