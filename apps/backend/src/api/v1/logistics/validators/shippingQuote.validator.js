import { AppError } from "../../../../core/errors/AppError.js";

const cleanStr = (val, max = 100) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate shipping quote request payload
export const validateShippingQuoteInput = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid shipping quote request.", 400);
  }

  const country = cleanStr(body.country, 10).toUpperCase();
  const city = cleanStr(body.city, 100).toLowerCase();

  if (!country || country.length < 2) {
    throw new AppError(
      "Destination country code (e.g., 'PK', 'US', 'DE') is required.",
      400,
    );
  }

  const totalWeightGrams = Math.max(
    0,
    parseInt(body.totalWeightGrams ?? 500, 10) || 0,
  );
  const cartSubtotal = Math.max(0, Number(body.cartSubtotal) || 0);

  return {
    country,
    city,
    totalWeightGrams,
    cartSubtotal,
  };
};