import { Router } from "express";
import authRoutes from "./features/auth/auth.routes";
import fileRoutes from "./features/files/files.routes";
import jobRoutes from "./features/jobs/jobs.routes";
import notificationRoutes from "./features/realtime/realtime.routes";

const router = Router();

// Define API routes
router.use("/auth", authRoutes);
router.use("/files", fileRoutes);
router.use("/jobs", jobRoutes);
router.use("/notifications", notificationRoutes);

export default router;
