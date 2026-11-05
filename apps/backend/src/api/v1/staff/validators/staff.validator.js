import { AppError } from "../../../../core/errors/AppError.js";
import {
  normalizeEmailCanonical,
  normalizePhoneE164,
} from "../../../../utils/identityNormalizer.util.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
// Matches staffRoleEnum in packages/db/schema/enums.js
const VALID_STAFF_ROLES = new Set([
  "store_manager",
  "cashier",
  "delivery_rider",
]);

const cleanStr = (val, max = 150) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validates the input for creating a new staff member
export const validateCreateStaffInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid staff creation payload.", 400);
  }

  const name = cleanStr(body.name, 150);
  const email = normalizeEmailCanonical(body.email);
  const phone = normalizePhoneE164(body.phone);
  const password = typeof body.password === "string" ? body.password : "";
  const role = VALID_STAFF_ROLES.has(body.role) ? body.role : "cashier";

  if (name.length < 2 || !email || !phone) {
    throw new AppError(
      "Staff full name, valid email, and valid phone number are required.",
      400,
    );
  }
  if (password.length < 6 || password.length > 128) {
    throw new AppError("Password must be between 6 and 128 characters.", 400);
  }

  let branchId = null;
  if (body.branchId) {
    if (typeof body.branchId !== "string" || !UUID_REGEX.test(body.branchId)) {
      throw new AppError("Invalid branchId UUID format.", 400);
    }
    branchId = body.branchId;
  }

  return { name, email, phone, password, role, branchId };
};

export const validateStaffLoginInput = (body) => {
  const email = normalizeEmailCanonical(body?.email);
  const password = typeof body?.password === "string" ? body.password : "";
  if (!email || password.length < 6) {
    throw new AppError("Valid staff email and password are required.", 400);
  }
  return { email, password };
};