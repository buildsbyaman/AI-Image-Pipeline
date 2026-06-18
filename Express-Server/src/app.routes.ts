import { Router } from "express";
import authRoutes from "./modules/auth/auth.routes";
import fileRoutes from "./modules/file/file.routes";
import jobRoutes from "./modules/job/job.routes";
import notificationRoutes from "./modules/notification/notification.routes";

const router = Router();

// Define API routes
router.use("/auth", authRoutes);
router.use("/files", fileRoutes);
router.use("/jobs", jobRoutes);
router.use("/notifications", notificationRoutes);

export default router;
