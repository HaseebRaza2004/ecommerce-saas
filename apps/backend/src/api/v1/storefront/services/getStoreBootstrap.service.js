import { eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { merchants, storePolicies } = schema;

// Fetch Storefront Bootstrap Data (Theme, UI, Policies, FAQs, Contact) for a given merchantId
export const getStoreBootstrapService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "storefront:bootstrap",
    async () => {
      const [merchantRows, policyRows] = await Promise.all([
        db
          .select({
            id: merchants.id,
            storeName: merchants.storeName,
            domainUrl: merchants.domainUrl,
            phone: merchants.phone,
            status: merchants.status,
            themeConfig: merchants.themeConfig,
            uiComponents: merchants.uiComponents,
            localization: merchants.localization,
          })
          .from(merchants)
          .where(eq(merchants.id, merchantId))
          .limit(1),
        db
          .select({
            privacyPolicy: storePolicies.privacyPolicy,
            termsOfService: storePolicies.termsOfService,
            refundPolicy: storePolicies.refundPolicy,
            shippingPolicy: storePolicies.shippingPolicy,
            faqs: storePolicies.faqs,
            contactDetails: storePolicies.contactDetails,
            updatedAt: storePolicies.updatedAt,
          })
          .from(storePolicies)
          .where(eq(storePolicies.merchantId, merchantId))
          .limit(1),
      ]);

      const store = merchantRows[0];
      if (!store || store.status === "suspended") {
        throw new AppError("Store is currently unavailable.", 404);
      }

      return {
        merchant_id: store.id,
        store_name: store.storeName,
        domain_url: store.domainUrl,
        phone: store.phone,
        theme_config: store.themeConfig,
        ui_components: store.uiComponents,
        localization: store.localization,
        policies: policyRows[0] || null,
      };
    },
    3600,
  );
};