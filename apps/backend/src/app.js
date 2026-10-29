import express from "express";
import cors from "cors";
import cokieParser from "cookie-parser";
import { globalErrorHandler } from "./core/errors/errorHandler.js";
import authRoutes from "./api/v1/auth/auth.routes.js";
import kycRoutes from "./api/v1/kyc/kyc.routes.js";
import storageRoutes from "./api/v1/storage/storage.routes.js";
import categoryRoutes from "./api/v1/categories/category.routes.js";
import productRoutes from "./api/v1/products/product.routes.js";
import promotionRoutes from "./api/v1/promotions/promotion.routes.js";
import cartRoutes from "./api/v1/cart/cart.routes.js";
// Temporary request logger middleware for debugging purposes
import { requestLogger } from "./core/middlewares/requestLogger.js";

const app = express();

// Global Security Middlewares
app.use(express.json({ limit: "10kb" }));
app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(cokieParser());

// Temporary Request Logger Middleware for Debugging Purposes
app.use(requestLogger);

// Health Check Endpoint (API Status)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Master E-Commerce SaaS API is alive and highly secure!",
  });
});

// API Versioning & Routing
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/kyc", kycRoutes);
app.use("/api/v1/storage", storageRoutes);
app.use("/api/v1/categories", categoryRoutes);
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/promotions", promotionRoutes);
app.use("/api/v1/cart", cartRoutes);

// Global Error Handler
app.use(globalErrorHandler);

export default app;