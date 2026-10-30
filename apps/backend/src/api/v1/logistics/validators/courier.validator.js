import { AppError } from "../../../../core/errors/AppError.js";

const cleanStr = (val, max = 150) =>
  typeof val === "string"
    ? val
        .replace(/[<>'"`;(){}]/g, "")
        .trim()
        .slice(0, max)
    : "";

// Validate courier creation payload
export const validateCreateCourier = (body) => {
  if (!body || typeof body !== "object") {
    throw new AppError("Invalid courier configuration payload.", 400);
  }

  const providerCode = cleanStr(body.providerCode, 50)
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, "");
  const displayName = cleanStr(body.displayName, 100);

  if (providerCode.length < 2 || displayName.length < 2) {
    throw new AppError(
      "providerCode (e.g., 'DHL', 'TCS') and displayName are required.",
      400,
    );
  }

  // Validate Factory / Warehouse Pickup Address for Automated Courier Pickup
  const rawPickup = body.pickupAddress;
  if (!rawPickup || typeof rawPickup !== "object") {
    throw new AppError(
      "Factory/Warehouse pickupAddress object is required.",
      400,
    );
  }

  const pickupAddress = {
    contactName: cleanStr(rawPickup.contactName, 100),
    phone: cleanStr(rawPickup.phone, 50),
    country: cleanStr(rawPickup.country, 10).toUpperCase(),
    city: cleanStr(rawPickup.city, 100),
    postalCode: cleanStr(rawPickup.postalCode, 30),
    streetAddress: cleanStr(rawPickup.streetAddress, 300),
    nearestLandmark: cleanStr(rawPickup.nearestLandmark, 200),
  };

  if (
    !pickupAddress.country ||
    !pickupAddress.city ||
    !pickupAddress.streetAddress ||
    !pickupAddress.phone
  ) {
    throw new AppError(
      "Pickup address requires country, city, streetAddress, and phone.",
      400,
    );
  }

  const apiCredentials =
    body.apiCredentials && typeof body.apiCredentials === "object"
      ? body.apiCredentials
      : {};

  return {
    providerCode,
    displayName,
    apiCredentials,
    pickupAddress,
    autoTriggerPickup: body.autoTriggerPickup !== false,
    isActive: body.isActive !== false,
  };
};