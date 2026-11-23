export const API = Object.freeze({
  HEALTH: "/api/health",
  AUTH: {
    REGISTER: "/api/v1/auth/admin/register",
    LOGIN: "/api/v1/auth/admin/login",
    ME: "/api/v1/auth/admin/me",
    REFRESH: "/api/v1/auth/admin/refresh",
    SESSIONS: "/api/v1/auth/admin/sessions",
    LOGOUT: "/api/v1/auth/admin/logout",
    LOGOUT_ALL: "/api/v1/auth/admin/logout-all",
  },
  OMNI_AUTH: {
    SEND_WHATSAPP_OTP: "/api/v1/omni-auth/whatsapp/send-otp",
    MERCHANT: "/api/v1/omni-auth/merchant",
  },
  STAFF: {
    LOGIN: "/api/v1/staff/login",
    BASE: "/api/v1/staff",
    BY_ID: (id) => `/api/v1/staff/${encodeURIComponent(id)}`,
  },
  ANALYTICS: {
    DASHBOARD: "/api/v1/analytics/dashboard",
    SUBSCRIPTION: "/api/v1/analytics/subscription",
  },
  KYC: {
    SESSION: "/api/v1/kyc/session",
    SUBMIT: "/api/v1/kyc/submit",
    STATUS: "/api/v1/kyc/status",
  },
  STORAGE: {
    PRESIGN_UPLOAD: "/api/v1/storage/presign-upload",
    PRESIGN_PRIVATE_READ: "/api/v1/storage/presign-private-read",
  },
  CATEGORIES: {
    BASE: "/api/v1/categories",
    BY_ID: (id) => `/api/v1/categories/${encodeURIComponent(id)}`,
  },
  PRODUCTS: {
    BASE: "/api/v1/products",
    BY_ID: (id) => `/api/v1/products/${encodeURIComponent(id)}`,
  },
  PROMOTIONS: {
    BASE: "/api/v1/promotions",
  },
  LOGISTICS: {
    COURIERS: "/api/v1/logistics/couriers",
    ZONES: "/api/v1/logistics/zones",
    CALCULATE: "/api/v1/logistics/calculate-shipping",
  },
  ORDERS: {
    BASE: "/api/v1/orders",
    STATUS: (id) => `/api/v1/orders/${encodeURIComponent(id)}/status`,
    VERIFY_DELIVERY: (id) =>
      `/api/v1/orders/${encodeURIComponent(id)}/verify-delivery`,
  },
  PAYMENTS: {
    CONFIG: "/api/v1/payments/config",
    CHECKOUT_OPTIONS: "/api/v1/payments/checkout-options",
    CURRENCY_QUOTE: "/api/v1/payments/currency-quote",
  },
  STOREFRONT: {
    BOOTSTRAP: "/api/v1/storefront/bootstrap",
    THEME: "/api/v1/storefront/theme",
    POLICIES: "/api/v1/storefront/policies",
  },
  REVIEWS: {
    BY_PRODUCT: (productId) =>
      `/api/v1/reviews/product/${encodeURIComponent(productId)}`,
    REPLY: (id) => `/api/v1/reviews/${encodeURIComponent(id)}/reply`,
    BY_ID: (id) => `/api/v1/reviews/${encodeURIComponent(id)}`,
  },
});