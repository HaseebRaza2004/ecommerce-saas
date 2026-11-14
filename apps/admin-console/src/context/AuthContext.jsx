"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { apiRequest } from "@/lib/apiClient";
import { useI18n } from "@/context/I18nContext";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [merchant, setMerchant] = useState(null);
  const [role, setRole] = useState("super_merchant");
  const [loading, setLoading] = useState(true);
  const { changeLanguage } = useI18n();

  const refreshProfile = useCallback(
    async (roleOverride = null) => {
      try {
        const profile = await apiRequest("/api/v1/auth/admin/me");
        setMerchant(profile);
        if (roleOverride) setRole(roleOverride);
        const savedLang = profile?.localization?.defaultLanguage;
        if (savedLang) changeLanguage(savedLang);
        return profile;
      } catch {
        setMerchant(null);
        return null;
      }
    },
    [changeLanguage],
  );

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const profile = await apiRequest("/api/v1/auth/admin/me");
        if (!isMounted) return;
        setMerchant(profile);
        if (profile?.localization?.defaultLanguage) {
          changeLanguage(profile.localization.defaultLanguage);
        }
      } catch {
        if (isMounted) setMerchant(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [changeLanguage]);

  const handleAuthSuccess = useCallback(
    async (authData) => {
      const nextRole = authData?.role || "super_merchant";
      setRole(nextRole);
      const profile = await refreshProfile(nextRole);
      if (!profile && authData?.merchant_id) {
        setMerchant({
          id: authData.merchant_id,
          storeName: authData.store_name || "Merchant Store",
          domainUrl: authData.domain_url || "",
          status: authData.status || "active",
        });
      }
    },
    [refreshProfile],
  );

  const logout = useCallback(async () => {
    await apiRequest("/api/v1/auth/admin/logout", { method: "POST" }).catch(
      () => {},
    );
    setMerchant(null);
    setRole("super_merchant");
  }, []);

  const value = useMemo(
    () => ({
      merchant,
      role,
      loading,
      refreshProfile,
      handleAuthSuccess,
      logout,
    }),
    [merchant, role, loading, refreshProfile, handleAuthSuccess, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);