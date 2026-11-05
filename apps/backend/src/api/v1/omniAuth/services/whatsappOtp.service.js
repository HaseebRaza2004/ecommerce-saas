import crypto from "crypto";
import { redisClient } from "../../../../config/redis.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

const hashOtp = (code) =>
  crypto.createHash("sha256").update(String(code)).digest("hex");

// Generate 6-Digit WhatsApp OTP & Store Hash in Redis (5-Min TTL)
export const sendWhatsappOtpService = async ({ phone, actorType }) => {
  const otpCode = String(crypto.randomInt(100000, 1000000));
  const otpKey = `wa:otp:${actorType}:${phone}`;
  const attemptKey = `wa:attempts:${actorType}:${phone}`;

  await Promise.all([
    redisClient.set(otpKey, hashOtp(otpCode), "EX", 300),
    redisClient.del(attemptKey),
  ]);

  return {
    phone,
    actor_type: actorType,
    expires_in_seconds: 300,
    // Returned in dev mode for instant Postman testing; in production sent via WhatsApp Cloud API
    dev_otp_preview:
      process.env.NODE_ENV !== "production" ? otpCode : undefined,
  };
};

// Verify WhatsApp 6-Digit OTP with 3-Attempt Brute-Force Lock
export const verifyWhatsappOtpService = async (phone, actorType, inputOtp) => {
  if (!phone || !inputOtp || !/^\d{6}$/.test(String(inputOtp))) {
    throw new AppError("Valid 6-digit WhatsApp OTP code is required.", 400);
  }

  const otpKey = `wa:otp:${actorType}:${phone}`;
  const attemptKey = `wa:attempts:${actorType}:${phone}`;

  const [storedHash, attempts] = await Promise.all([
    redisClient.get(otpKey),
    redisClient.incr(attemptKey),
  ]);

  if (attempts === 1) await redisClient.expire(attemptKey, 300);
  if (attempts > 3) {
    await redisClient.del(otpKey);
    throw new AppError(
      "Too many failed OTP attempts. Please request a new WhatsApp code.",
      429,
    );
  }

  if (!storedHash || storedHash !== hashOtp(inputOtp)) {
    throw new AppError("Invalid or expired WhatsApp OTP code.", 401);
  }

  await Promise.all([redisClient.del(otpKey), redisClient.del(attemptKey)]);
  return true;
};