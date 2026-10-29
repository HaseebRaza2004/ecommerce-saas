import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, schema } from "../../config/db.client.js";
import { redisClient } from "../../config/redis.client.js";
import { AppError } from "../errors/AppError.js";
import { extractToken } from "./auth.guard.js";
import { syncDomainCache } from "../redis/domainCache.service.js";

const { merchants } = schema;
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Middleware to resolve tenant context based on request headers, query parameters, or JWT token
export const resolveTenant = async (req, res, next) => {
  try {
    // 1. If Admin JWT Cookie/Bearer exists, extract merchantId from signed token
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "super_secret_fallback_key_2026",
      );
      req.merchantId = decoded.id;
      return next();
    }

    // 2. Check direct x-merchant-id header or ?merchantId= query from Next.js Edge Rewrite
    const directId = req.headers["x-merchant-id"] || req.query.merchantId;
    if (directId && UUID_REGEX.test(directId)) {
      req.merchantId = directId;
      return next();
    }

    // 3. Resolve by Store Domain (x-store-domain header or ?domain=master.local)
    const domain = (req.headers["x-store-domain"] || req.query.domain || "")
      .toLowerCase()
      .trim();
    if (!domain) {
      return next(
        new AppError(
          "Store identifier (domain or merchantId) is required.",
          400,
        ),
      );
    }

    const cachedTenant = await redisClient.get(`tenant:domain:${domain}`);
    if (cachedTenant) {
      const parsed = JSON.parse(cachedTenant);
      if (parsed.status === "suspended")
        return next(new AppError("Store is unavailable.", 403));
      req.merchantId = parsed.merchant_id;
      return next();
    }

    // Fallback to NeonDB if domain wasn't in Redis yet, then warm up Redis
    const rows = await db
      .select()
      .from(merchants)
      .where(eq(merchants.domainUrl, domain))
      .limit(1);
    if (!rows[0] || rows[0].status === "suspended") {
      return next(
        new AppError("Store not found or currently unavailable.", 404),
      );
    }

    const payload = {
      merchant_id: rows[0].id,
      store_name: rows[0].storeName,
      domain_url: rows[0].domainUrl,
      status: rows[0].status,
    };
    syncDomainCache(domain, payload);
    req.merchantId = rows[0].id;
    next();
  } catch (error) {
    return next(new AppError("Failed to resolve store tenant context.", 401));
  }
};