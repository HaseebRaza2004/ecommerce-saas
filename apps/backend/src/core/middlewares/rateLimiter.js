import { redisClient } from "../../config/redis.client.js";
import { sendResponse } from "../../utils/responseHandler.js";
import { extractClientIp } from "../../utils/ip.util.js";

// Rate Limiter Middleware: Limit Requests per IP or Merchant
export const rateLimiter = (
  limit = 60,
  windowInSeconds = 60,
  scope = "global",
) => {
  return async (req, res, next) => {
    try {
      const ip = extractClientIp(req);
      const actorId = req.merchantId
        ? `merchant:${req.merchantId}:ip:${ip}`
        : `ip:${ip}`;
      const redisKey = `rl:${scope}:${actorId}`;

      const pipeline = redisClient.pipeline();
      pipeline.incr(redisKey);
      pipeline.ttl(redisKey);
      const results = await pipeline.exec();

      const requestCount = results[0][1];
      const currentTtl = results[1][1];

      if (requestCount === 1 || currentTtl === -1) {
        await redisClient.expire(redisKey, windowInSeconds);
      }

      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, limit - requestCount));

      if (requestCount > limit) {
        return sendResponse(
          res,
          429,
          "Too many requests. Please wait before trying again.",
        );
      }

      next();
    } catch (error) {
      console.error("⚠️ Rate Limiter Fallback:", error.message);
      next();
    }
  };
};