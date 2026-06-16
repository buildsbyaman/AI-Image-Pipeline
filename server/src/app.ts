import express from "express";
import { setupMiddlewares } from "./middleware/setup.middleware";
import { errorHandler } from "./middleware/error.middleware";
import apiRoutes from "./routes";

const app = express();

// Apply global middlewares (CORS, Parsers, Rate Limiter, Morgan, Helmet)
setupMiddlewares(app);

// API Routes
app.use("/api", apiRoutes);

// Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Global Error Handler
app.use(errorHandler);

export default app;
