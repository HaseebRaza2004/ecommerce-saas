import { AppError } from "../../../../core/errors/AppError.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const cleanStr = (val, max = 150) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

export const validateCustomerRegister = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid registration payload.", 400);
  }

  const name = cleanStr(body.name, 150);
  const phone = cleanStr(body.phone, 50);
  const email = body.email ? cleanStr(body.email, 255).toLowerCase() : null;
  const password = typeof body.password === "string" ? body.password : "";

  if (name.length < 2 || phone.length < 7) {
    throw new AppError("Full name and a valid phone number are required.", 400);
  }
  if (email && !EMAIL_REGEX.test(email)) {
    throw new AppError("Invalid email address format.", 400);
  }
  if (password.length < 6 || password.length > 128) {
    throw new AppError("Password must be between 6 and 128 characters.", 400);
  }

  return { name, phone, email, password };
};

export const validateCustomerLogin = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid login payload.", 400);
  }

  const identifier = cleanStr(
    body.phoneOrEmail || body.phone || body.email,
    255,
  );
  const password = typeof body.password === "string" ? body.password : "";

  if (!identifier || password.length < 6) {
    throw new AppError("Phone/Email and password are required.", 400);
  }

  return { identifier, password };
};