"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/apiClient";
import { validatePhone, validateOtp } from "@/lib/validators";
import { useAuth } from "@/context/AuthContext";
import { useI18n } from "@/context/I18nContext";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import AlertBanner from "@/components/ui/AlertBanner";

export default function OmniMerchantAuthForm() {
  const { handleAuthSuccess } = useAuth();
  const { t } = useI18n();
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devPreview, setDevPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sendWhatsappOtp = async () => {
    setError("");
    if (!validatePhone(phone))
      return setError("Enter a valid WhatsApp phone number.");
    setLoading(true);
    try {
      const res = await apiRequest("/api/v1/omni-auth/whatsapp/send-otp", {
        method: "POST",
        body: { phone: phone.trim(), actorType: "merchant" },
      });
      setOtpSent(true);
      if (res?.dev_otp_preview)
        setDevPreview(`Dev OTP Preview: ${res.dev_otp_preview}`);
    } catch (err) {
      setError(err.message || "Failed to send WhatsApp OTP.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOmni = async (e) => {
    e.preventDefault();
    setError("");
    if (!validateOtp(otpCode))
      return setError("Enter a valid 6-digit OTP code.");
    setLoading(true);
    try {
      const data = await apiRequest("/api/v1/omni-auth/merchant", {
        method: "POST",
        body: {
          provider: "whatsapp_otp",
          phone: phone.trim(),
          email: email.trim(),
          otpCode,
        },
      });
      await handleAuthSuccess(data);
    } catch (err) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={verifyOmni} className="space-y-3.5">
      <AlertBanner
        type="error"
        message={error}
        onDismiss={() => setError("")}
      />
      <AlertBanner type="info" message={devPreview} />
      <Input
        label={t("phoneLabel")}
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="0311-9876543"
      />
      <Input
        label={t("emailLabel")}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="owner@electrohub.pk (Optional)"
      />
      {!otpSent ? (
        <Button
          type="button"
          onClick={sendWhatsappOtp}
          loading={loading}
          fullWidth
        >
          {t("sendOtpBtn")}
        </Button>
      ) : (
        <div className="space-y-3">
          <Input
            label="6-Digit WhatsApp OTP"
            required
            maxLength={6}
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value)}
            placeholder="482910"
          />
          <Button type="submit" loading={loading} fullWidth>
            {t("verifyOtpBtn")}
          </Button>
        </div>
      )}
    </form>
  );
}