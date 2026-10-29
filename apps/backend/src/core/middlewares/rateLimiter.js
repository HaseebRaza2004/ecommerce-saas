import { redisClient } from "../../config/redis.client.js";
import { sendResponse } from "../../utils/responseHandler.js";
import { extractClientIp } from "../../utils/ip.util.js";

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

      // ⚡ Single-Hop Pipeline: INCR and EXPIRE NX in 1 single network round-trip
      const pipeline = redisClient.pipeline();
      pipeline.incr(redisKey);
      pipeline.call("EXPIRE", redisKey, windowInSeconds, "NX");
      const results = await pipeline.exec();

      const requestCount = results[0][1];

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
      next();
    }
  };
};