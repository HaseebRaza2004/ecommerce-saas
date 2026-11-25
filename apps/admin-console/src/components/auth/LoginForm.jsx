"use client";

import { useState } from "react";
import { Lock, Mail } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useToast } from "@/context/ToastContext";
import { validateLoginForm } from "@/lib/authValidators";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { WhatsappOtpPanel } from "@/components/auth/WhatsappOtpPanel";
import { OmniSocialButtons } from "@/components/auth/OmniSocialButtons";

export function LoginForm({ onSuccess }) {
  const { loginMerchant } = useAuth();
  const { t } = useLocale();
  const { showToast } = useToast();
  const [showWhatsapp, setShowWhatsapp] = useState(false);
  const [form, setForm] = useState({ identifier: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);

  if (showWhatsapp) {
    return (
      <WhatsappOtpPanel
        onSuccess={onSuccess}
        onBack={() => setShowWhatsapp(false)}
      />
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const fieldErrors = validateLoginForm(form);
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setBusy(true);
    try {
      await loginMerchant({
        email: form.identifier.trim(),
        password: form.password,
      });
      showToast({
        title: t("welcomeBack"),
        message: "Authenticated with Zero-Trust session.",
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
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {apiError && <Alert tone="error" message={apiError} />}
        <Input
          label={t("emailOrPhone")}
          icon={Mail}
          forceLtr
          autoComplete="username"
          placeholder={t("emailPlaceholder")}
          value={form.identifier}
          onChange={(e) =>
            setForm((p) => ({ ...p, identifier: e.target.value }))
          }
          error={errors.identifier}
        />
        <Input
          label={t("password")}
          type="password"
          icon={Lock}
          forceLtr
          autoComplete="current-password"
          placeholder={t("passwordPlaceholder")}
          value={form.password}
          onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
          error={errors.password}
        />
        <Button type="submit" fullWidth size="lg" loading={busy}>
          {t("signIn")}
        </Button>
      </form>

      <OmniSocialButtons onSelectWhatsapp={() => setShowWhatsapp(true)} />
    </div>
  );
};