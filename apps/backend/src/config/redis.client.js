import Redis from "ioredis";
import { env } from "./env.js";

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error("🚨 CRITICAL: REDIS_URL environment variable is missing!");
  process.exit(1);
}

// Redis Client Configuration
export const redisClient = new Redis(redisUrl, {
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
  maxRetriesPerRequest: 3,

  retryStrategy(times) {
    if (times > 10) {
      console.error(
        "❌ Redis max retries reached. Stopping to prevent CPU/Event-loop block.",
      );
      return null;
    }
    return Math.min(times * 50, 2000);
  },
});

// System Monitoring Logs
redisClient.on("connect", () =>
  console.log("✅ Upstash Redis Connected Successfully!"),
);
redisClient.on("error", (err) =>
  console.error("⚠️ Redis Connection Error:", err.message),
);
redisClient.on("close", () =>
  console.warn("⚠️ Redis Connection Closed by Remote."),
);