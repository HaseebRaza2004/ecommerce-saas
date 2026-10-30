import { eq, asc } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";
import { getOrSetTenantCache } from "../../../../core/redis/stampedeCache.service.js";

const { shippingZones, merchantCouriers } = schema;

// Fetch All Active Shipping Zones Joined with Courier Details (Redis/L1 Cached)
export const getShippingZonesService = async (merchantId) => {
  return await getOrSetTenantCache(
    merchantId,
    "logistics:zones",
    async () => {
      return await db
        .select({
          id: shippingZones.id,
          zoneName: shippingZones.zoneName,
          courierId: shippingZones.courierId,
          courierCode: merchantCouriers.providerCode,
          courierName: merchantCouriers.displayName,
          isCourierActive: merchantCouriers.isActive,
          autoTriggerPickup: merchantCouriers.autoTriggerPickup,
          countries: shippingZones.countries,
          cities: shippingZones.cities,
          calculationType: shippingZones.calculationType,
          flatRate: shippingZones.flatRate,
          baseWeightGrams: shippingZones.baseWeightGrams,
          ratePerExtraKg: shippingZones.ratePerExtraKg,
          freeShippingMinOrder: shippingZones.freeShippingMinOrder,
          priority: shippingZones.priority,
        })
        .from(shippingZones)
        .innerJoin(
          merchantCouriers,
          eq(shippingZones.courierId, merchantCouriers.id),
        )
        .where(eq(shippingZones.merchantId, merchantId))
        .orderBy(asc(shippingZones.priority));
    },
    3600,
  );
};