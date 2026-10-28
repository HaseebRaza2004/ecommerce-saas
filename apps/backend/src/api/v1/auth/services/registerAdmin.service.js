import bcrypt from "bcrypt";
import { eq, or } from "drizzle-orm";
import { db, sql, schema } from "../../../../config/db.client.js";
import { AppError } from "../../../../core/errors/AppError.js";
import { syncDomainCache } from "../../../../core/redis/domainCache.service.js";

const { merchants } = schema;

// Admin Registration Service: Create Merchant, Subscription, Policy, and Payment Config
export const adminRegisterService = async ({
  storeName,
  domainUrl,
  email,
  password,
  phone,
}) => {
  const existing = await db
    .select({ id: merchants.id })
    .from(merchants)
    .where(or(eq(merchants.email, email), eq(merchants.domainUrl, domainUrl)))
    .limit(1);

  if (existing.length > 0) {
    throw new AppError(
      "An account with this email or domain already exists.",
      409,
    );
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const createdRows = await sql`
    WITH new_merchant AS (
      INSERT INTO merchants (store_name, domain_url, email, password, phone)
      VALUES (${storeName}, ${domainUrl}, ${email}, ${hashedPassword}, ${phone})
      RETURNING id, store_name, domain_url, db_region, status
    ),
    init_sub AS (
      INSERT INTO merchant_subscriptions (merchant_id, plan_name, billing_cycle, features)
      SELECT id, 'basic', 'monthly', '{"max_products": 500, "allow_promo_codes": true}'::jsonb
      FROM new_merchant
    ),
    init_policy AS (
      INSERT INTO store_policies (merchant_id) SELECT id FROM new_merchant
    ),
    init_pay AS (
      INSERT INTO merchant_payment_configs (merchant_id) SELECT id FROM new_merchant
    )
    SELECT * FROM new_merchant;
  `;

  const merchant = createdRows[0];
  const payload = {
    merchant_id: merchant.id,
    store_name: merchant.store_name,
    domain_url: merchant.domain_url,
    db_region: merchant.db_region,
    status: merchant.status,
  };

  syncDomainCache(merchant.domain_url, payload);
  return payload;
};