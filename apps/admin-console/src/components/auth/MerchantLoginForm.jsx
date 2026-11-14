"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { validateEmail, validatePassword } from "@/lib/validators";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AlertBanner from "@/components/ui/AlertBanner";

export default function MerchantLoginForm() {
  const { handleAuthSuccess } = useAuth();
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateEmail(email))
      return setError("Please enter a valid official email address.");
    if (!validatePassword(password))
      return setError("Password must be at least 8 characters.");

    setSubmitting(true);
    try {
      const data = await apiRequest("/api/v1/auth/admin/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });
      await handleAuthSuccess(data);
    } catch (err) {
      setError(
        err.message || "Invalid credentials or account temporarily locked.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <AlertBanner
        type="error"
        message={error}
        onDismiss={() => setError("")}
      />
      <Input
        label={t("emailLabel")}
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="owner@electrohub.pk"
      />
      <Input
        label={t("passwordLabel")}
        type="password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••••••"
      />
      <Button type="submit" loading={submitting} fullWidth>
        {t("signInBtn")}
      </Button>
    </form>
  );
}