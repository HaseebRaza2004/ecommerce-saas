import express from "express";
import cors from "cors";
import { globalErrorHandler } from "./core/errors/errorHandler.js";

const app = express();

// 1. Global Security Middlewares
app.use(express.json({ limit: "10kb" })); // Payload size strictly locked to 10kb
app.use(cors());

// 2. Base Health Route (Check karne ke liye ke server zinda hai ya nahi)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Master E-Commerce SaaS API is alive and highly secure!",
  });
});

// 3. The Global Error Handler (Yeh hamesha sabse aakhir mein aayega)
app.use(globalErrorHandler);

export default app;