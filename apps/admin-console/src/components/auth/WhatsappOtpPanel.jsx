"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, KeyRound, MessageCircle } from "lucide-react";
import { authService } from "@/services/auth.service";
import { validateWhatsappStep } from "@/lib/authValidators";
import { useAuth } from "@/context/AuthContext";
import { useLocale } from "@/context/LocaleContext";
import { useToast } from "@/context/ToastContext";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";

export function WhatsappOtpPanel({ onSuccess, onBack }) {
  const { loginWithOmniAuth } = useAuth();
  const { t } = useLocale();
  const { showToast } = useToast();
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devPreview, setDevPreview] = useState("");
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const fieldErrors = validateWhatsappStep({ phone, otpCode, otpSent });
    setErrors(fieldErrors);
    if (Object.keys(fieldErrors).length > 0) return;

    setBusy(true);
    try {
      if (!otpSent) {
        const res = await authService.sendWhatsappOtp({ phone });
        setOtpSent(true);
        setDevPreview(res?.dev_otp_preview || "");
        showToast({
          title: "OTP Sent",
          message: "Check your WhatsApp for the 6-digit code.",
          tone: "success",
        });
      } else {
        await loginWithOmniAuth({
          provider: "whatsapp_otp",
          phone: phone.trim(),
          otpCode: otpCode.trim(),
        });
        showToast({
          title: "Verified",
          message: "Signed in securely via WhatsApp.",
          tone: "success",
        });
        onSuccess?.();
      }
    } catch (err) {
      setApiError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-fade-in space-y-4 text-start"
      noValidate
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-ink">{t("whatsappTitle")}</p>
        <p className="text-xs text-muted">{t("whatsappSub")}</p>
      </div>
      {apiError && <Alert tone="error" message={apiError} />}
      {devPreview && (
        <Alert
          tone="info"
          title="Local Dev OTP Preview"
          message={`Use code ${devPreview} on localhost.`}
        />
      )}
      <Input
        label={t("whatsappPhone")}
        icon={MessageCircle}
        forceLtr
        placeholder="+923001234567"
        value={phone}
        disabled={otpSent || busy}
        onChange={(e) => setPhone(e.target.value)}
        error={errors.phone}
      />
      {otpSent && (
        <Input
          label={t("otpCode")}
          icon={KeyRound}
          forceLtr
          inputMode="numeric"
          maxLength={6}
          placeholder="482910"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
          error={errors.otpCode}
        />
      )}
      <div className="flex items-center gap-2">
        {otpSent && (
          <Button
            variant="secondary"
            onClick={() => {
              setOtpSent(false);
              setOtpCode("");
              setDevPreview("");
            }}
          >
            {t("changeNumber")}
          </Button>
        )}
        <Button type="submit" fullWidth size="lg" loading={busy}>
          <span>{otpSent ? t("verifySignIn") : t("sendOtp")}</span>
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
      <Button
        variant="link"
        onClick={onBack}
        className="w-full justify-center gap-1.5 text-xs"
      >
        <ArrowLeft className="size-3.5 rtl:rotate-180" />
        <span>{t("backToPassword")}</span>
      </Button>
    </form>
  );
};