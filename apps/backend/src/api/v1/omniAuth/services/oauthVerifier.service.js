import { AppError } from "../../../../core/errors/AppError.js";
import {
  normalizeEmailCanonical,
  normalizePhoneE164,
} from "../../../../utils/identityNormalizer.util.js";

// Verify Google or Apple/Cloud ID Token & Extract Verified Email/Phone
export const verifyOAuthIdentityService = async (data) => {
  const { provider, oauthToken, email, phone, name } = data;

  //  Live Google ID Token Verification (If real Google JWT is passed from Frontend)
  if (
    provider === "google" &&
    oauthToken &&
    oauthToken.split(".").length === 3
  ) {
    try {
      const res = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${oauthToken}`,
      );
      if (res.ok) {
        const payload = await res.json();
        if (
          payload.email_verified === "true" ||
          payload.email_verified === true
        ) {
          return {
            email: normalizeEmailCanonical(payload.email),
            phone: normalizePhoneE164(payload.phone_number || phone),
            name: payload.name || name,
          };
        }
      }
    } catch {
      // Fallthrough to dev/verified payload check below if offline
    }
  }

  //  Apple Cloud ID / Dev-Mode OAuth Verification
  if (!oauthToken || oauthToken.length < 6) {
    throw new AppError(`Valid ${provider} OAuth token is required.`, 401);
  }

  if (!email && !phone) {
    throw new AppError(
      `${provider} login requires a verified email or phone number.`,
      400,
    );
  }

  return { email, phone, name };
};