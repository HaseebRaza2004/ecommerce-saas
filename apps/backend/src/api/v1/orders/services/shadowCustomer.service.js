import { and, eq } from "drizzle-orm";
import { db, schema } from "../../../../config/db.client.js";

const { customers } = schema;

// Upsert Shadow Guest Account & Save Structured Address Book Entry
export const resolveShadowCustomerService = async (merchantId, data) => {
  const newAddressEntry = {
    country: data.shippingCountry,
    city: data.shippingCity,
    postalCode: data.shippingPostalCode,
    streetAddress: data.shippingAddressFull,
    nearestLandmark: data.nearestLandmark,
    phone: data.customerPhone,
    altPhone: data.customerAltPhone,
    coordinates: data.shippingCoordinates,
    savedAt: new Date().toISOString(),
  };

  // Check if customer already exists for this store by primary phone
  const existingRows = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.merchantId, merchantId),
        eq(customers.phone, data.customerPhone),
      ),
    )
    .limit(1);

  if (existingRows[0]) {
    const existing = existingRows[0];
    const currentAddresses = Array.isArray(existing.addresses)
      ? existing.addresses
      : [];
    const updatedAddresses = [newAddressEntry, ...currentAddresses].slice(0, 5);

    await db
      .update(customers)
      .set({
        name: data.customerName || existing.name,
        email: data.customerEmail || existing.email,
        altPhone: data.customerAltPhone || existing.altPhone,
        addresses: updatedAddresses,
      })
      .where(eq(customers.id, existing.id));

    return existing.id;
  }

  const [created] = await db
    .insert(customers)
    .values({
      merchantId,
      name: data.customerName,
      email: data.customerEmail,
      phone: data.customerPhone,
      altPhone: data.customerAltPhone,
      isGuest: true,
      addresses: [newAddressEntry],
    })
    .returning({ id: customers.id });

  return created.id;
};