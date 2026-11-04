import bcrypt from "bcrypt";
import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

const { customers } = schema;

// Register Customer OR Upgrade Existing Guest Shadow Account Seamlessly
export const registerCustomerService = async (
  merchantId,
  { name, phone, email, password },
) => {
  const existingRows = await db
    .select()
    .from(customers)
    .where(
      and(eq(customers.merchantId, merchantId), eq(customers.phone, phone)),
    )
    .limit(1);

  const existing = existingRows[0];
  if (existing && !existing.isGuest) {
    throw new AppError(
      "An account with this phone number already exists. Please log in.",
      409,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  // Upgrade Shadow Guest Profile -> Full Registered Customer (Preserves Order History & Addresses!)
  if (existing && existing.isGuest) {
    const [upgraded] = await db
      .update(customers)
      .set({
        name,
        email: email || existing.email,
        password: hashedPassword,
        isGuest: false,
      })
      .where(eq(customers.id, existing.id))
      .returning();

    return upgraded;
  }

  // Otherwise, Create Fresh Registered Customer Account
  const [created] = await db
    .insert(customers)
    .values({
      merchantId,
      name,
      phone,
      email,
      password: hashedPassword,
      isGuest: false,
      addresses: [],
    })
    .returning();

  return created;
};