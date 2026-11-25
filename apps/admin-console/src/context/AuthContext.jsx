"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { authService } from "@/services/auth.service";
import { setUnauthorizedHandler } from "@/lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [status, setStatus] = useState("loading");

  const applyAuthenticatedUser = (profile, explicitRole = null) => {
    setUser(profile);
    setRole(explicitRole || profile?.role || "super_merchant");
    setStatus("authenticated");
  };

  const clearSession = () => {
    setUser(null);
    setRole(null);
    setStatus("unauthenticated");
  };

  const refreshProfile = async (explicitRole = null) => {
    const profile = await authService.getMe();
    applyAuthenticatedUser(profile, explicitRole);
    return profile;
  };

  useEffect(() => {
    const controller = new AbortController();
    setUnauthorizedHandler(clearSession);

    authService
      .getMe(controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted) applyAuthenticatedUser(profile);
      })
      .catch((err) => {
        if (!controller.signal.aborted && err?.name !== "AbortError") {
          clearSession();
        }
      });

    return () => {
      controller.abort();
      setUnauthorizedHandler(null);
    };
  }, []);

  const loginMerchant = async (creds) => {
    const session = await authService.loginMerchant(creds);
    await refreshProfile(session?.role || "super_merchant");
    return session;
  };

  const registerMerchant = async (payload) => {
    const session = await authService.registerMerchant(payload);
    await refreshProfile(session?.role || "super_merchant");
    return session;
  };

  const loginStaff = async (creds) => {
    const session = await authService.loginStaff(creds);
    await refreshProfile(session?.role || "store_manager");
    return session;
  };

  const loginWithOmniAuth = async (payload) => {
    const session = await authService.omniMerchantAuth(payload);
    await refreshProfile(session?.role || "super_merchant");
    return session;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearSession();
    }
  };

  const logoutAll = async () => {
    const res = await authService.logoutAll();
    clearSession();
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        status,
        isAuthenticated: status === "authenticated",
        loginMerchant,
        registerMerchant,
        loginStaff,
        loginWithOmniAuth,
        refreshProfile,
        logout,
        logoutAll,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}