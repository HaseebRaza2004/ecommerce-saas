import { API } from "@/config/apiEndpoints";
import { apiRequest } from "@/lib/apiClient";

export const authService = {
  getMe: (signal) => apiRequest(API.AUTH.ME, { method: "GET", signal }),

  loginMerchant: ({ email, password }) =>
    apiRequest(API.AUTH.LOGIN, {
      method: "POST",
      body: { email: email.trim(), password },
    }),

  registerMerchant: ({
    storeName,
    domainUrl,
    email,
    password,
    phone,
    dbRegion,
  }) =>
    apiRequest(API.AUTH.REGISTER, {
      method: "POST",
      body: {
        storeName: storeName.trim(),
        domainUrl: domainUrl.trim().toLowerCase(),
        email: email.trim(),
        password,
        phone: phone.trim(),
        dbRegion: dbRegion || "asia-east",
      },
    }),

  loginStaff: ({ domain, email, password }) =>
    apiRequest(API.STAFF.LOGIN, {
      method: "POST",
      domain: domain.trim().toLowerCase(),
      query: { domain: domain.trim().toLowerCase() },
      body: { email: email.trim(), password },
    }),

  sendWhatsappOtp: ({ phone }) =>
    apiRequest(API.OMNI_AUTH.SEND_WHATSAPP_OTP, {
      method: "POST",
      body: { phone: phone.trim(), actorType: "merchant" },
    }),

  omniMerchantAuth: (payload) =>
    apiRequest(API.OMNI_AUTH.MERCHANT, {
      method: "POST",
      body: payload,
    }),

  getSessions: (signal) =>
    apiRequest(API.AUTH.SESSIONS, { method: "GET", signal }),

  logout: () => apiRequest(API.AUTH.LOGOUT, { method: "POST", body: {} }),

  logoutAll: () =>
    apiRequest(API.AUTH.LOGOUT_ALL, { method: "POST", body: {} }),
};