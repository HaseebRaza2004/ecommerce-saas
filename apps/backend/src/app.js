import express from "express";
import cors from "cors";
import cokieParser from "cookie-parser";
import { globalErrorHandler } from "./core/errors/errorHandler.js";
import authRoutes from "./api/v1/auth/auth.routes.js";

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

// Health Check Endpoint (API Status)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Master E-Commerce SaaS API is alive and highly secure!",
  });
});

// API Versioning & Routing
app.use("/api/v1/auth", authRoutes);

// Global Error Handler
app.use(globalErrorHandler);

export default app;