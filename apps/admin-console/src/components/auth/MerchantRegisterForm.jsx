"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import {
  validateEmail,
  validateDomain,
  validatePhone,
  validatePassword,
} from "@/lib/validators";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import AlertBanner from "@/components/ui/AlertBanner";

const REGION_OPTIONS = [
  { value: "asia-east", label: "Asia Singapore (Sub-25ms)" },
  { value: "eu-central", label: "EU Frankfurt" },
  { value: "us-east", label: "US East Virginia" },
];

export default function MerchantRegisterForm() {
  const { handleAuthSuccess } = useAuth();
  const { t } = useI18n();
  const [form, setForm] = useState({
    storeName: "",
    domainUrl: "",
    email: "",
    password: "",
    phone: "",
    dbRegion: "asia-east",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const setField = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateDomain(form.domainUrl))
      return setError("Enter a valid domain (e.g. electrohub.pk).");
    if (!validateEmail(form.email))
      return setError("Enter a valid email address.");
    if (!validatePhone(form.phone))
      return setError("Enter a valid phone (+923001234567).");
    if (!validatePassword(form.password))
      return setError("Password requires min 8 characters.");

    setSubmitting(true);
    try {
      const data = await apiRequest("/api/v1/auth/admin/register", {
        method: "POST",
        body: {
          ...form,
          domainUrl: form.domainUrl.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
        },
      });
      await handleAuthSuccess(data);
    } catch (err) {
      setError(err.message || "Store registration failed.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <AlertBanner
        type="error"
        message={error}
        onDismiss={() => setError("")}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label={t("storeNameLabel")}
          required
          value={form.storeName}
          onChange={(e) => setField("storeName", e.target.value)}
          placeholder="Electro Hub"
        />
        <Input
          label={t("domainUrlLabel")}
          required
          value={form.domainUrl}
          onChange={(e) => setField("domainUrl", e.target.value)}
          placeholder="electrohub.pk"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label={t("emailLabel")}
          type="email"
          required
          value={form.email}
          onChange={(e) => setField("email", e.target.value)}
          placeholder="owner@electrohub.pk"
        />
        <Input
          label={t("phoneLabel")}
          type="tel"
          required
          value={form.phone}
          onChange={(e) => setField("phone", e.target.value)}
          placeholder="+923001234567"
        />
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label={t("passwordLabel")}
          type="password"
          required
          value={form.password}
          onChange={(e) => setField("password", e.target.value)}
          placeholder="Min 8 chars"
        />
        <Select
          label={t("regionLabel")}
          value={form.dbRegion}
          onChange={(e) => setField("dbRegion", e.target.value)}
          options={REGION_OPTIONS}
        />
      </div>
      <Button type="submit" loading={submitting} fullWidth>
        {t("registerBtn")}
      </Button>
    </form>
  );
}