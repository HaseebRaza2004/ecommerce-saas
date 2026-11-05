import { and, eq, desc } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { staffMembers } = schema;

// Service to retrieve the list of staff members for a merchant
export const getStaffListService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "staff:all",
    async () => {
      return await db
        .select({
          id: staffMembers.id,
          name: staffMembers.name,
          email: staffMembers.email,
          phone: staffMembers.phone,
          role: staffMembers.role,
          branchId: staffMembers.branchId,
          isActive: staffMembers.isActive,
          createdAt: staffMembers.createdAt,
        })
        .from(staffMembers)
        .where(eq(staffMembers.merchantId, merchantId))
        .orderBy(desc(staffMembers.createdAt));
    },
    1800,
  );
};

export const deleteStaffService = async (merchantId, staffId) => {
  const [deleted] = await db
    .delete(staffMembers)
    .where(
      and(
        eq(staffMembers.id, staffId),
        eq(staffMembers.merchantId, merchantId),
      ),
    )
    .returning({
      id: staffMembers.id,
      name: staffMembers.name,
      role: staffMembers.role,
    });

  if (!deleted) {
    throw new AppError("Staff member not found in your store.", 404);
  }

  await invalidateTenantCache(merchantId);
  return deleted;
};