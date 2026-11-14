"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { validateDomain, validateEmail } from "@/lib/validators";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AlertBanner from "@/components/ui/AlertBanner";

export default function StaffLoginForm() {
  const { handleAuthSuccess } = useAuth();
  const { t } = useI18n();
  const [domain, setDomain] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const cleanDomain = domain.trim().toLowerCase();
    if (!validateDomain(cleanDomain))
      return setError("Enter a valid store domain (e.g. electrohub.pk).");
    if (!validateEmail(email))
      return setError("Enter a valid staff email address.");

    setLoading(true);
    try {
      const data = await apiRequest(
        `/api/v1/staff/login?domain=${encodeURIComponent(cleanDomain)}`,
        {
          method: "POST",
          domain: cleanDomain,
          body: { email: email.trim().toLowerCase(), password },
        },
      );
      await handleAuthSuccess(data);
    } catch (err) {
      setError(err.message || "Staff authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <AlertBanner
        type="error"
        message={error}
        onDismiss={() => setError("")}
      />
      <Input
        label={t("domainUrlLabel")}
        required
        value={domain}
        onChange={(e) => setDomain(e.target.value)}
        placeholder="electrohub.pk"
      />
      <Input
        label={t("emailLabel")}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="bilal@electrohub.pk"
      />
      <Input
        label={t("passwordLabel")}
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••••••"
      />
      <Button type="submit" loading={loading} fullWidth>
        {t("tabStaffLogin")}
      </Button>
    </form>
  );
}