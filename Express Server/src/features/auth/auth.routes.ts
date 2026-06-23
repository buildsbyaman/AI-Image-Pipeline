import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { authenticate } from "./auth.middleware";
import { userRateLimiter } from "../../shared/middleware";

const router = Router();

// Strict rate limiter for credential-sensitive endpoints — 10 attempts per 15 minutes per IP.
// skipSuccessfulRequests ensures legitimate users don't exhaust the limit on normal usage.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts. Please try again in 15 minutes." },
});

router.post("/signup", authLimiter, AuthController.signup);
router.post("/login", authLimiter, AuthController.login);
router.post("/logout", authenticate, userRateLimiter, AuthController.logout);
router.post("/refresh", authLimiter, AuthController.refresh);
router.get("/me", authenticate, userRateLimiter, AuthController.getMe);


export default router;
