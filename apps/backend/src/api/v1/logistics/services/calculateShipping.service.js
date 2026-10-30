import { AppError } from "../../../../core/errors/AppError.js";
import { getShippingZonesService } from "./getShippingZones.service.js";

// Validate and Calculate Shipping Quote for a Merchant
export const calculateShippingService = async (
  merchantId,
  { country, city, totalWeightGrams, cartSubtotal },
) => {
  const allZones = await getShippingZonesService(merchantId);
  const activeZones = allZones.filter((z) => z.isCourierActive);

  if (activeZones.length === 0) {
    throw new AppError(
      "No active shipping couriers configured for this store.",
      422,
    );
  }

  // 1. Tiered Geo-Matching: Exact City+Country -> Country Only -> Global '*' Fallback
  const matchedZone =
    activeZones.find(
      (z) =>
        (z.countries.includes(country) || z.countries.includes("*")) &&
        Array.isArray(z.cities) &&
        z.cities.length > 0 &&
        z.cities.includes(city),
    ) ||
    activeZones.find(
      (z) =>
        z.countries.includes(country) && (!z.cities || z.cities.length === 0),
    ) ||
    activeZones.find((z) => z.countries.includes("*"));

  if (!matchedZone) {
    throw new AppError(
      `Shipping is currently not available for ${country.toUpperCase()}.`,
      422,
    );
  }

  // 2. Check Free Shipping Threshold (Blueprint Phase 4: Free Shipping Progress Bar)
  const freeMin = matchedZone.freeShippingMinOrder
    ? Number(matchedZone.freeShippingMinOrder)
    : null;
  if (
    matchedZone.calculationType === "free_shipping" ||
    (freeMin !== null && cartSubtotal >= freeMin)
  ) {
    return {
      zone_id: matchedZone.id,
      zone_name: matchedZone.zoneName,
      courier_id: matchedZone.courierId,
      courier_code: matchedZone.courierCode,
      courier_name: matchedZone.courierName,
      shipping_total: "0.00",
      is_free_shipping: true,
      auto_trigger_pickup: matchedZone.autoTriggerPickup,
    };
  }

  // 3. Calculate Weight-Based or Flat Rate Shipping
  let shippingFee = Number(matchedZone.flatRate);

  if (matchedZone.calculationType === "weight_based") {
    const baseWeight = matchedZone.baseWeightGrams || 1000;
    const extraGrams = Math.max(0, totalWeightGrams - baseWeight);
    const extraKgCeil = Math.ceil(extraGrams / 1000);
    shippingFee += extraKgCeil * Number(matchedZone.ratePerExtraKg || 0);
  }

  return {
    zone_id: matchedZone.id,
    zone_name: matchedZone.zoneName,
    courier_id: matchedZone.courierId,
    courier_code: matchedZone.courierCode,
    courier_name: matchedZone.courierName,
    shipping_total: shippingFee.toFixed(2),
    is_free_shipping: false,
    free_shipping_remaining: freeMin
      ? Math.max(0, freeMin - cartSubtotal).toFixed(2)
      : null,
    auto_trigger_pickup: matchedZone.autoTriggerPickup,
  };
};