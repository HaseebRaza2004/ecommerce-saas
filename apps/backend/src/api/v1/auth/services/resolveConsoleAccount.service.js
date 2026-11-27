import { eq, or } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import {
  normalizeEmailCanonical,
  normalizePhoneE164,
} from "../../../../utils/identityNormalizer.util.js";

const { merchants, staffMembers } = schema;

const parseEnvSet = (raw, normalizer) =>
  new Set(
    String(raw || "")
      .split(",")
      .map((item) => normalizer(item.trim()))
      .filter(Boolean),
  );

const isPlatformSuperAdmin = (email, phone) => {
  const adminEmails = parseEnvSet(
    process.env.SAAS_SUPER_ADMIN_EMAILS,
    normalizeEmailCanonical,
  );
  const adminPhones = parseEnvSet(
    process.env.SAAS_SUPER_ADMIN_PHONES,
    normalizePhoneE164,
  );
  return Boolean(
    (email && adminEmails.has(email)) || (phone && adminPhones.has(phone)),
  );
};

/**
 * 🔍 Zero-Domain Console Identity Resolver (Owner + SaaS Super Admin + Staff in 1 Parallel Hop)
 */
export const resolveConsoleAccountService = async ({
  email,
  phone,
  targetMerchantId = null,
}) => {
  const merchantConds = [];
  const staffConds = [];

  if (email) {
    merchantConds.push(eq(merchants.email, email));
    staffConds.push(eq(staffMembers.email, email));
  }
  if (phone) {
    merchantConds.push(eq(merchants.phone, phone));
    staffConds.push(eq(staffMembers.phone, phone));
  }
  if (merchantConds.length === 0) return [];

  const [merchantRows, staffRows] = await Promise.all([
    db
      .select()
      .from(merchants)
      .where(or(...merchantConds)),
    db
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
        dbRegion: merchants.dbRegion,
        storeStatus: merchants.status,
      })
      .from(staffMembers)
      .innerJoin(merchants, eq(staffMembers.merchantId, merchants.id))
      .where(or(...staffConds)),
  ]);

  const candidates = [];

  for (const m of merchantRows) {
    if (m.status === "suspended") continue;
    const role = isPlatformSuperAdmin(m.email, m.phone)
      ? "saas_super_admin"
      : "super_merchant";
    candidates.push({
      actor_id: m.id,
      merchant_id: m.id,
      staff_id: null,
      role,
      name: m.storeName,
      email: m.email,
      phone: m.phone,
      password: m.password,
      store_name: m.storeName,
      domain_url: m.domainUrl,
      db_region: m.dbRegion,
      status: m.status,
    });
  }

  for (const s of staffRows) {
    if (!s.isActive || s.storeStatus === "suspended") continue;
    candidates.push({
      actor_id: s.staffId,
      merchant_id: s.merchantId,
      staff_id: s.staffId,
      role: s.role,
      name: s.name,
      email: s.email,
      phone: s.phone,
      password: s.password,
      branch_id: s.branchId,
      store_name: s.storeName,
      domain_url: s.domainUrl,
      db_region: s.dbRegion,
      status: s.storeStatus,
    });
  }

  return targetMerchantId
    ? candidates.filter((c) => c.merchant_id === targetMerchantId)
    : candidates;
};