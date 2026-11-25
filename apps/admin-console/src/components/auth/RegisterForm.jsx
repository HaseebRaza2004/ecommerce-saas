"use client";

import { useState } from "react";
import { Globe, Lock, Mail, MapPin, Phone, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useToast } from "@/context/ToastContext";
import { COUNTRIES_DATA, getRegionForCountry } from "@/data/countries.data";
import { sanitizeDomain, validateRegisterForm } from "@/lib/authValidators";
import { Input } from "@/components/ui/Input";
import { Dropdown } from "@/components/ui/Dropdown";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { PasswordStrengthBar } from "@/components/auth/PasswordStrengthBar";

const COUNTRY_OPTIONS = COUNTRIES_DATA.map((c) => ({
  value: c.code,
  label: c.label,
}));

export function RegisterForm({ onSuccess }) {
  const { registerMerchant } = useAuth();
  const { t } = useLocale();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    storeName: "",
    domainUrl: "",
    email: "",
    phone: "",
    password: "",
    country: "PK",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (key) => (e) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const fieldErrors = validateRegisterForm(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setBusy(true);
    try {
      await registerMerchant({
        ...form,
        domainUrl: sanitizeDomain(form.domainUrl),
        dbRegion: getRegionForCountry(form.country),
      });
      showToast({
        title: t("createStore"),
        message: "Your merchant console is ready.",
        tone: "success",
      });
      onSuccess?.();
    } catch (err) {
      setApiError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
      {apiError && <Alert tone="error" message={apiError} />}
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Input
          label={t("storeName")}
          icon={Store}
          placeholder="Electro Hub"
          value={form.storeName}
          onChange={update("storeName")}
          error={errors.storeName}
        />
        <Input
          label={t("storeDomain")}
          icon={Globe}
          forceLtr
          placeholder="electrohub.pk"
          value={form.domainUrl}
          onChange={update("domainUrl")}
          error={errors.domainUrl}
        />
      </div>
      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        <Input
          label={t("businessEmail")}
          type="email"
          icon={Mail}
          forceLtr
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
          value={form.email}
          onChange={update("email")}
          error={errors.email}
        />
        <Input
          label={t("whatsappPhone")}
          icon={Phone}
          forceLtr
          placeholder="+923001234567"
          value={form.phone}
          onChange={update("phone")}
          error={errors.phone}
        />
      </div>
      <Dropdown
        label={t("country")}
        icon={MapPin}
        align="start"
        value={form.country}
        onChange={(val) => setForm((prev) => ({ ...prev, country: val }))}
        options={COUNTRY_OPTIONS}
        error={errors.country}
      />
      <Input
        label={t("strongPassword")}
        type="password"
        icon={Lock}
        forceLtr
        autoComplete="new-password"
        placeholder={t("strongPassPlaceholder")}
        value={form.password}
        onChange={update("password")}
        error={errors.password}
      />
      <PasswordStrengthBar password={form.password} />
      <Button type="submit" fullWidth size="lg" loading={busy}>
        {t("createStore")}
      </Button>
    </form>
  );
};