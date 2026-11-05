import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

const { staffMembers, merchants } = schema;

// Service to authenticate a staff member for a merchant
export const loginStaffService = async (merchantId, { email, password }) => {
  const rows = await db
    .select({
      staffId: staffMembers.id,
      merchantId: staffMembers.merchantId,
      name: staffMembers.name,
      email: staffMembers.email,
      phone: staffMembers.phone,
      password: staffMembers.password,
      role: staffMembers.role,
      branchId: staffMembers.branchId,
      isActive: staffMembers.isActive,
      storeName: merchants.storeName,
      domainUrl: merchants.domainUrl,
      storeStatus: merchants.status,
    })
    .from(staffMembers)
    .innerJoin(merchants, eq(staffMembers.merchantId, merchants.id))
    .where(
      and(
        eq(staffMembers.merchantId, merchantId),
        eq(staffMembers.email, email),
      ),
    )
    .limit(1);

  const staff = rows[0];
  if (!staff || !(await bcrypt.compare(password, staff.password))) {
    throw new AppError("Invalid staff email or password.", 401);
  }

  if (!staff.isActive || staff.storeStatus === "suspended") {
    throw new AppError(
      "Your staff account or store is currently deactivated.",
      403,
    );
  }

  return {
    merchant_id: staff.merchantId,
    staff_id: staff.staffId,
    staff_name: staff.name,
    role: staff.role,
    branch_id: staff.branchId,
    store_name: staff.storeName,
    domain_url: staff.domainUrl,
    status: staff.storeStatus,
  };
};