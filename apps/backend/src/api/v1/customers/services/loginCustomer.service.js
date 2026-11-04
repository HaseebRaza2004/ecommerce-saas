import bcrypt from "bcrypt";
import { and, eq, or } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

const { customers } = schema;

// Authenticate Customer via Phone or Email within the Current Store
export const loginCustomerService = async (
  merchantId,
  { identifier, password },
) => {
  const cleanId = identifier.toLowerCase().trim();

  const rows = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.merchantId, merchantId),
        or(eq(customers.phone, identifier), eq(customers.email, cleanId)),
      ),
    )
    .limit(1);

  const customer = rows[0];
  if (!customer || customer.isGuest || !customer.password) {
    throw new AppError(
      "Invalid credentials or account not registered yet.",
      401,
    );
  }

  const isMatch = await bcrypt.compare(password, customer.password);
  if (!isMatch) {
    throw new AppError("Invalid phone/email or password.", 401);
  }

  return customer;
};