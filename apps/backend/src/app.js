import express from "express";
import cookieParser from "cookie-parser";
import { globalErrorHandler } from "./core/errors/errorHandler.js";
import { AppError } from "./core/errors/AppError.js";
import { requestLogger } from "./core/middlewares/requestLogger.js";
import { securityHeadersGuard } from "./core/middlewares/securityHeaders.guard.js";
import { corsAndCsrfGuard } from "./core/middlewares/corsAndCsrf.guard.js";
import { payloadSanitizerGuard } from "./core/middlewares/payloadSanitizer.guard.js";
import authRoutes from "./api/v1/auth/auth.routes.js";
import omniAuthRoutes from "./api/v1/omniAuth/omniAuth.routes.js";
import kycRoutes from "./api/v1/kyc/kyc.routes.js";
import storageRoutes from "./api/v1/storage/storage.routes.js";
import categoryRoutes from "./api/v1/categories/category.routes.js";
import productRoutes from "./api/v1/products/product.routes.js";
import promotionRoutes from "./api/v1/promotions/promotion.routes.js";
import cartRoutes from "./api/v1/cart/cart.routes.js";
import logisticsRoutes from "./api/v1/logistics/logistics.routes.js";
import orderRoutes from "./api/v1/orders/order.routes.js";
import paymentRoutes from "./api/v1/payments/payment.routes.js";
import customerRoutes from "./api/v1/customers/customer.routes.js";
import storefrontRoutes from "./api/v1/storefront/storefront.routes.js";
import reviewRoutes from "./api/v1/reviews/review.routes.js";
import staffRoutes from "./api/v1/staff/staff.routes.js";
import analyticsRoutes from "./api/v1/analytics/analytics.routes.js";

const app = express();

//  Hide Express server signature
app.disable("x-powered-by");

// Security Middlewares (CSP, HSTS, Dynamic CORS, CSRF, Prototype Pollution Shield)
app.use(requestLogger);
app.use(securityHeadersGuard);
app.use(corsAndCsrfGuard);
app.use(express.json({ limit: "10kb" }));
app.use(cookieParser());
app.use(payloadSanitizerGuard);

app.get("/api/health", (req, res) => {
  res
    .status(200)
    .json({
      error: false,
      status: 200,
      message: "🛡️ Zero-Trust SaaS API is alive!",
    });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/omni-auth", omniAuthRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/storage", storageRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/promotions", promotionRoutes);
app.use("/api/v1/cart", cartRoutes);
app.use("/api/v1/logistics", logisticsRoutes);
app.use("/api/v1/orders", orderRoutes);
app.use("/api/v1/payments", paymentRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/storefront", storefrontRoutes);
app.use("/api/v1/reviews", reviewRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/analytics", analyticsRoutes);

//  Catch-All 404 JSON Handler
app.use((req, res, next) => {
  next(
    new AppError(
      `Route ${req.method} ${req.originalUrl} not found on this server.`,
      404,
    ),
  );
});

app.use(globalErrorHandler);

export default app;