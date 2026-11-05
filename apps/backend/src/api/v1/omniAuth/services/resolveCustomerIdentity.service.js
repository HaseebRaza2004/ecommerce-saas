import bcrypt from "bcrypt";
import { and, eq, or } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

const { customers, orders, productReviews } = schema;

// Resolve Customer Identity Across Multiple OmniAuth Providers (Google, Apple, WhatsApp, Email/Password)
export const resolveCustomerIdentityService = async (
  merchantId,
  { provider, email, phone, name, password },
) => {
  const matchConditions = [];
  if (email) matchConditions.push(eq(customers.email, email));
  if (phone) matchConditions.push(eq(customers.phone, phone));

  const matchedRows = await db
    .select()
    .from(customers)
    .where(and(eq(customers.merchantId, merchantId), or(...matchConditions)));

  // Case 1: New Customer -> Create Single Unified Account
  if (matchedRows.length === 0) {
    const hashedPassword = password ? await bcrypt.hash(password, 12) : null;
    const [created] = await db
      .insert(customers)
      .values({
        merchantId,
        name,
        email,
        phone: phone || `unlinked_${Date.now()}`,
        password: hashedPassword,
        isGuest: false,
        addresses: [],
      })
      .returning();
    return created;
  }

  // Case 2: Found 1 or 2 Partial Accounts (e.g., Google Email-only + WhatsApp Phone-only) -> Auto-Merge!
  const primary = matchedRows.find((r) => !r.isGuest) || matchedRows[0];
  const secondary =
    matchedRows.length > 1
      ? matchedRows.find((r) => r.id !== primary.id)
      : null;

  if (provider === "email_password") {
    if (
      !primary.password ||
      !password ||
      !(await bcrypt.compare(password, primary.password))
    ) {
      throw new AppError("Invalid email/phone or password.", 401);
    }
  }

  let mergedAddresses = Array.isArray(primary.addresses)
    ? [...primary.addresses]
    : [];
  if (secondary) {
    const secAddresses = Array.isArray(secondary.addresses)
      ? secondary.addresses
      : [];
    mergedAddresses = [...mergedAddresses, ...secAddresses].slice(0, 5);
    await Promise.all([
      db
        .update(orders)
        .set({ customerId: primary.id })
        .where(eq(orders.customerId, secondary.id)),
      db
        .update(productReviews)
        .set({ customerId: primary.id })
        .where(eq(productReviews.customerId, secondary.id)),
      db.delete(customers).where(eq(customers.id, secondary.id)),
    ]);
  }

  const [updated] = await db
    .update(customers)
    .set({
      name: primary.name === "Guest Buyer" ? name : primary.name,
      email: email || primary.email,
      phone: phone || primary.phone,
      isGuest: false,
      addresses: mergedAddresses,
    })
    .where(eq(customers.id, primary.id))
    .returning();

  return updated;
};