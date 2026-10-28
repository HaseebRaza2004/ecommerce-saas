import crypto from "crypto";
import { redisClient } from "../../../../config/redis.client.js";
import { AppError } from "../../../../core/errors/AppError.js";

// Create KYC Session Service: Generate QR Session Token and Spoken Challenge Code
export const createKycSessionService = async (merchantId) => {
  const sessionToken = crypto.randomBytes(24).toString("hex");
  const spokenChallengeCode = String(crypto.randomInt(1000, 10000));

  const sessionPayload = {
    merchantId,
    spokenChallengeCode,
    status: "PENDING",
    createdAt: Date.now(),
  };

  await Promise.all([
    redisClient.set(
      `verify:session:${sessionToken}`,
      JSON.stringify(sessionPayload),
      "EX",
      300,
    ),
    redisClient.set(
      `verify:challenge:${merchantId}`,
      spokenChallengeCode,
      "EX",
      300,
    ),
  ]);

  return {
    qrSessionToken: sessionToken,
    spokenChallengeCode,
    expiresInSeconds: 300,
    colorSequence: ["RED_1000MS", "BLUE_1000MS"],
  };
};

// Get KYC Session Status Service: Retrieve Session Status and Challenge Code
export const getQrSessionStatusService = async (merchantId, sessionToken) => {
  const raw = await redisClient.get(`verify:session:${sessionToken}`);
  if (!raw) {
    throw new AppError("Verification QR session expired or not found.", 404);
  }

  const session = JSON.parse(raw);
  if (session.merchantId !== merchantId) {
    throw new AppError("Unauthorized access to verification session.", 403);
  }

  return {
    status: session.status,
    spokenChallengeCode: session.spokenChallengeCode,
  };
};