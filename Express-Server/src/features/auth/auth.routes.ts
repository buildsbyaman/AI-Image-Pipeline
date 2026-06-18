import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "./auth.middleware";

const router = Router();

router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/logout", authenticate, AuthController.logout);
router.post("/refresh", AuthController.refresh);
router.get("/me", authenticate, AuthController.getMe);

export default router;
