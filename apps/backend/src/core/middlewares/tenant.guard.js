import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { db, schema } from "../../config/db.client.js";
import { redisClient } from "../../config/redis.client.js";
import { AppError } from "../errors/AppError.js";
import { extractToken } from "./auth.guard.js";
import { syncDomainCache } from "../redis/domainCache.service.js";
import { getL1Cache, setL1Cache } from "../redis/l1Cache.util.js";

const { merchants } = schema;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const resolveTenant = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "super_secret_fallback_key_2026");
      req.merchantId = decoded.id;
      return next();
    }

    const directId = req.headers["x-merchant-id"] || req.query.merchantId;
    if (directId && UUID_REGEX.test(directId)) {
      req.merchantId = directId;
      return next();
    }

    const domain = (req.headers["x-store-domain"] || req.query.domain || "").toLowerCase().trim();
    if (!domain) {
      return next(new AppError("Store identifier (domain or merchantId) is required.", 400));
    }

    const domainKey = `tenant:domain:${domain}`;
    // ⚡ 1. Check L1 RAM Cache first (0.1ms — skips Singapore network hop)
    const l1Tenant = getL1Cache(domainKey);
    if (l1Tenant) {
      if (l1Tenant.status === "suspended") return next(new AppError("Store is unavailable.", 403));
      req.merchantId = l1Tenant.merchant_id;
      return next();
    }

    // ⚡ 2. Check L2 Upstash Redis (Singapore)
    const cachedTenant = await redisClient.get(domainKey);
    if (cachedTenant) {
      const parsed = JSON.parse(cachedTenant);
      setL1Cache(domainKey, parsed, 60);
      if (parsed.status === "suspended") return next(new AppError("Store is unavailable.", 403));
      req.merchantId = parsed.merchant_id;
      return next();
    }

    // ⚡ 3. Fallback to NeonDB
    const rows = await db.select().from(merchants).where(eq(merchants.domainUrl, domain)).limit(1);
    if (!rows[0] || rows[0].status === "suspended") {
      return next(new AppError("Store not found or currently unavailable.", 404));
    }

    const payload = { merchant_id: rows[0].id, store_name: rows[0].storeName, domain_url: rows[0].domainUrl, status: rows[0].status };
    setL1Cache(domainKey, payload, 60);
    syncDomainCache(domain, payload);
    req.merchantId = rows[0].id;
    next();
  } catch (error) {
    return next(new AppError("Failed to resolve store tenant context.", 401));
  }
};