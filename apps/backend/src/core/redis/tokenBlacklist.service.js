import { redisClient } from "../../config/redis.client.js";

// Blacklist JWT Tokens in Redis with TTL (default 15 minutes)
export const blacklistToken = async (token, ttlSeconds = 900) => {
  try {
    if (!token) return false;
    await redisClient.set(`bl:jwt:${token}`, "revoked", "EX", ttlSeconds);
    return true;
  } catch (error) {
    console.error("⚠️ Token Blacklist Error:", error.message);
    return false;
  }
};

// Check if a JWT Token is Blacklisted in Redis
export const isTokenBlacklisted = async (token) => {
  try {
    if (!token) return false;
    const status = await redisClient.get(`bl:jwt:${token}`);
    return status === "revoked";
  } catch (error) {
    return false;
  }
};