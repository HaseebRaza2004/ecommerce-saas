import { sendResponse } from '../../../utils/responseHandler.js';
import { sendTokenResponse } from '../../../utils/jwt.util.js';
import { adminLoginService } from './auth.service.js';

/**
 * 🛡️ ADMIN LOGIN CONTROLLER
 * Responsibility: Validate Request -> Call Service Layer -> Send Secure Token.
 */
export const adminLogin = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // 1. Payload Validation (Strict Types)
        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return sendResponse(res, 400, "Invalid email or password format.");
        }

        const sanitizedEmail = email.toLowerCase().trim();

        // 2. Call Service Layer (Database Logic)
        // Agar email/password ghalat hue, toh service khud AppError throw karegi jo Global Handler pakar lega.
        const merchantData = await adminLoginService(sanitizedEmail, password);

        // 3. Generate Token & Send Cookie (Successful Login)
        return sendTokenResponse(merchantData, 200, res, "Admin logged in successfully.");

    } catch (error) {
        next(error); // Passes AppError (e.g., "Invalid Credentials") to Global Error Handler
    }
};