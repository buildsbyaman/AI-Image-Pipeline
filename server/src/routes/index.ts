import { Router } from "express";
import authRoutes from "../modules/auth/auth.routes";
import fileRoutes from "../modules/file/file.routes";

const router = Router();

// Define API routes
router.use("/auth", authRoutes);
router.use("/files", fileRoutes);

export default router;
