import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { merchants, staffMembers } = schema;

/**
 * 👤 Fetch Logged-In Console Profile (Supports Owner, SaaS Super Admin & Live Staff Check)
 */
export const getAdminProfileService = async (
  merchantId,
  staffId = null,
  role = "super_merchant",
) => {
  if (staffId) {
    return await getOrSetTenantCache(
      merchantId,
      `auth:profile:staff:${staffId}`,
      async () => {
        const rows = await db
          .select({
            staff_id: staffMembers.id,
            merchant_id: staffMembers.merchantId,
            name: staffMembers.name,
            email: staffMembers.email,
            phone: staffMembers.phone,
            role: staffMembers.role,
            branch_id: staffMembers.branchId,
            is_active: staffMembers.isActive,
            store_name: merchants.storeName,
            domain_url: merchants.domainUrl,
            status: merchants.status,
          })
          .from(staffMembers)
          .innerJoin(merchants, eq(staffMembers.merchantId, merchants.id))
          .where(
            and(
              eq(staffMembers.id, staffId),
              eq(staffMembers.merchantId, merchantId),
            ),
          )
          .limit(1);

        const staff = rows[0];
        if (!staff || !staff.is_active || staff.status === "suspended") {
          throw new AppError(
            "Staff account is deactivated or store is suspended.",
            403,
          );
        }
        return staff;
      },
      900,
    );
  }

  return await getOrSetTenantCache(
    merchantId,
    `auth:profile:owner:${role}`,
    async () => {
      const rows = await db
        .select({
          merchant_id: merchants.id,
          store_name: merchants.storeName,
          domain_url: merchants.domainUrl,
          email: merchants.email,
          phone: merchants.phone,
          status: merchants.status,
          db_region: merchants.dbRegion,
          theme_config: merchants.themeConfig,
          localization: merchants.localization,
        })
        .from(merchants)
        .where(eq(merchants.id, merchantId))
        .limit(1);

      if (!rows[0] || rows[0].status === "suspended") {
        throw new AppError("Merchant store not found or suspended.", 404);
      }
      return { ...rows[0], staff_id: null, name: rows[0].store_name, role };
    },
    900,
  );
};