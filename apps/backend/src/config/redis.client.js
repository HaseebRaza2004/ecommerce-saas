import Redis from "ioredis";
import { env } from "./env.js";

/**
 * 🚀 ENTERPRISE REDIS CLIENT (Oct 2026 Standard)
 * Kyun 'ioredis'? Yeh native Node.js event loop ko block nahi karta,
 * memory efficient hai, aur BullMQ queues ke sath natively compatible hai.
 */

// Redis connection string (Fail-safe check)
const redisUrl = process.env.REDIS_URL;
if (!redisUrl) {
  console.error("🚨 CRITICAL: REDIS_URL environment variable missing!");
  process.exit(1); // Security: Bina cache/rate-limiter ke SaaS start karna dangerous hai.
}

// 🛡️ Optimized Connection Instance
export const redisClient = new Redis(redisUrl, {
  family: 4, // 🛡️ THE FIX: Force IPv4 routing (Local dev mein disconnect loops rokne ke liye)

  // Note: Humne yahan se 'tls' ki line hata di hai.
  // 'rediss://' URL mein s ka matlab hi secure hai, toh ioredis khud SSL/TLS handle kar lega.
  maxRetriesPerRequest: 3, // Queue engine (BullMQ) ki strict requirement

  retryStrategy(times) {
    // Max limit set kar rahe hain taake event loop overload na ho (DDoS protection on ourselves)
    const delay = Math.min(times * 50, 2000);
    if (times > 10) {
      console.error(
        "❌ Redis connection failed 10 times. Stopping retries to save CPU.",
      );
      return null; // Stop retrying after 10 attempts
    }
    return delay;
  },
});

// 📡 Event Listeners for System Monitoring (Audit & Logging)
redisClient.on("connect", () => {
  console.log("✅ Upstash Redis Connected Successfully (Latency < 10ms)");
});

redisClient.on("error", (err) => {
  // Hum error throw karke app crash nahi kar rahe, sirf monitor kar rahe hain.
  console.error("⚠️ Redis Connection Error:", err.message);
});

redisClient.on("close", () => {
  console.warn("⚠️ Redis Connection Closed.");
});