import { pgEnum } from "drizzle-orm/pg-core";

// STRICT POSTGRESQL ENUMS (Mongoose-style Enum Enforcement at DB Level)

// 1. Tenant & Subscription Enums
export const storeStatusEnum = pgEnum("store_status", [
  "active",
  "suspended",
  "maintenance",
  "coming_soon",
]);
export const planNameEnum = pgEnum("plan_name", [
  "basic",
  "standard",
  "enterprise",
]);
export const billingCycleEnum = pgEnum("billing_cycle", [
  "monthly",
  "six_months",
  "yearly",
]);

// 2. Staff & RBAC Roles (Module 4 & 7)
export const staffRoleEnum = pgEnum("staff_role", [
  "super_merchant",
  "store_manager",
  "cashier",
  "delivery_rider",
  "warehouse_manager",
]);

// 3. Product & Discount Enums
export const productTypeEnum = pgEnum("product_type", ["physical", "digital"]);
export const productStatusEnum = pgEnum("product_status", [
  "active",
  "draft",
  "archived",
]);
export const promotionTypeEnum = pgEnum("promotion_type", [
  "store_wide_sale",
  "selected_products",
  "promo_code",
]);
export const discountTypeEnum = pgEnum("discount_type", [
  "fixed_amount",
  "percentage",
]);

// 4. Logistics & Rate Calculation Enums
export const shippingCalcTypeEnum = pgEnum("shipping_calc_type", [
  "flat_rate",
  "weight_based",
  "live_api_rate",
  "free_shipping",
]);

// 5. Order State Machine Enums (Blueprint Q24)
export const orderSourceEnum = pgEnum("order_source", [
  "web_storefront",
  "mobile_app",
  "pos_terminal",
]);
export const orderStatusEnum = pgEnum("order_status", [
  "draft",
  "pending_verification",
  "pending_payment",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refund_pending",
  "refunded",
  "returned",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "paid",
  "partially_paid",
  "failed",
  "refunded",
]);

// 6. Merchant KYC & Product Review Enums
export const kycDocTypeEnum = pgEnum("kyc_doc_type", [
  "cnic",
  "national_id",
  "passport",
  "driving_license",
]);

export const kycStatusEnum = pgEnum("kyc_status", [
  "unsubmitted",
  "pending_review",
  "verified",
  "rejected",
]);

export const reviewStatusEnum = pgEnum("review_status", [
  "pending",
  "published",
  "flagged",
]);
