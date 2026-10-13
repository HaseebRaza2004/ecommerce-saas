import { redisClient } from "../../config/redis.client.js";
import { sendResponse } from "../../utils/responseHandler.js";

// Rate Limiter Middleware
export const rateLimiter = (limit = 60, windowInSeconds = 60) => {
  return async (req, res, next) => {
    try {
      const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
      const redisKey = `rate-limit:${ip}`;

      const requests = await redisClient.incr(redisKey);

      if (requests === 1) {
        await redisClient.expire(redisKey, windowInSeconds);
      }

      if (requests > limit) {
        console.warn(`🚨 Rate Limit Exceeded for IP: ${ip}`);
        return sendResponse(
          res,
          429,
          "Too many requests. Please try again later.",
        );
      }

      next();
    } catch (error) {
      console.error("⚠️ Rate Limiter Error:", error);
      next();
    }
  };
};