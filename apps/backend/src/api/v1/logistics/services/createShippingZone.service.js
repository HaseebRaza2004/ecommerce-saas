import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { invalidateTenantCache } from "../../../../core/redis/tenantCache.service.js";

const { shippingZones, merchantCouriers } = schema;

// Create a new shipping zone for a merchant with validation and caching
export const createShippingZoneService = async (merchantId, data) => {
  // 1. Verify courierId belongs to this exact merchant (IDOR Defense)
  const courierRows = await db
    .select({
      id: merchantCouriers.id,
      displayName: merchantCouriers.displayName,
    })
    .from(merchantCouriers)
    .where(
      and(
        eq(merchantCouriers.id, data.courierId),
        eq(merchantCouriers.merchantId, merchantId),
      ),
    )
    .limit(1);

  if (!courierRows[0]) {
    throw new AppError(
      "Selected courier provider was not found in your store.",
      404,
    );
  }

  // 2. Insert shipping zone rule
  const [createdZone] = await db
    .insert(shippingZones)
    .values({
      merchantId,
      zoneName: data.zoneName,
      courierId: data.courierId,
      countries: data.countries,
      cities: data.cities,
      calculationType: data.calculationType,
      flatRate: data.flatRate,
      baseWeightGrams: data.baseWeightGrams,
      ratePerExtraKg: data.ratePerExtraKg,
      freeShippingMinOrder: data.freeShippingMinOrder,
      priority: data.priority,
    })
    .returning();

  await invalidateTenantCache(merchantId);

  return {
    ...createdZone,
    courierDisplayName: courierRows[0].displayName,
  };
};