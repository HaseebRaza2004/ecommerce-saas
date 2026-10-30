import { AppError } from "../../../../core/errors/AppError.js";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const VALID_CALC_TYPES = new Set([
  "flat_rate",
  "weight_based",
  "live_api_rate",
  "free_shipping",
]);
const cleanStr = (val, max = 100) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate shipping zone creation payload
export const validateCreateZone = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid shipping zone payload.", 400);
  }

  const zoneName = cleanStr(body.zoneName, 100);
  if (zoneName.length < 2) {
    throw new AppError("zoneName must be between 2 and 100 characters.", 400);
  }

  if (
    !body.courierId ||
    typeof body.courierId !== "string" ||
    !UUID_REGEX.test(body.courierId)
  ) {
    throw new AppError("A valid courierId UUID is required.", 400);
  }

  const countries =
    Array.isArray(body.countries) && body.countries.length > 0
      ? [
          ...new Set(
            body.countries
              .map((c) => cleanStr(c, 10).toUpperCase())
              .filter(Boolean),
          ),
        ]
      : ["*"]; // '*' acts as Global Fallback

  const cities = Array.isArray(body.cities)
    ? [
        ...new Set(
          body.cities
            .map((c) => cleanStr(c, 100).toLowerCase())
            .filter(Boolean),
        ),
      ]
    : [];

  const calculationType = VALID_CALC_TYPES.has(body.calculationType)
    ? body.calculationType
    : "weight_based";

  const flatRate = Math.max(0, Number(body.flatRate) || 0).toFixed(2);
  const baseWeightGrams = Math.max(
    100,
    parseInt(body.baseWeightGrams ?? 1000, 10) || 1000,
  );
  const ratePerExtraKg = Math.max(0, Number(body.ratePerExtraKg) || 0).toFixed(
    2,
  );
  const freeShippingMinOrder =
    body.freeShippingMinOrder !== undefined &&
    body.freeShippingMinOrder !== null
      ? Math.max(0, Number(body.freeShippingMinOrder)).toFixed(2)
      : null;

  const priority = Math.max(
    1,
    Math.min(100, parseInt(body.priority ?? 1, 10) || 1),
  );

  return {
    zoneName,
    courierId: body.courierId,
    countries,
    cities,
    calculationType,
    flatRate,
    baseWeightGrams,
    ratePerExtraKg,
    freeShippingMinOrder,
    priority,
  };
};