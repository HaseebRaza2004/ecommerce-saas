import bcrypt from "bcrypt";
import { and, eq, or } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { staffMembers } = schema;

// Service to create a new staff member for a merchant
export const createStaffService = async (
  merchantId,
  { name, email, phone, password, role, branchId },
) => {
  const existing = await db
    .select({ id: staffMembers.id })
    .from(staffMembers)
    .where(
      and(
        eq(staffMembers.merchantId, merchantId),
        or(eq(staffMembers.email, email), eq(staffMembers.phone, phone)),
      ),
    )
    .limit(1);

  if (existing.length > 0) {
    throw new AppError(
      "A staff member with this email or phone already exists in your store.",
      409,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const [created] = await db
    .insert(staffMembers)
    .values({
      merchantId,
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      branchId,
      isActive: true,
    })
    .returning({
      id: staffMembers.id,
      merchantId: staffMembers.merchantId,
      name: staffMembers.name,
      email: staffMembers.email,
      phone: staffMembers.phone,
      role: staffMembers.role,
      branchId: staffMembers.branchId,
      isActive: staffMembers.isActive,
      createdAt: staffMembers.createdAt,
    });

  await invalidateTenantCache(merchantId);
  return created;
};