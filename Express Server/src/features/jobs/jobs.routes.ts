import { Router } from "express";
import { authenticate } from "../auth/auth.middleware";
import { getJobs, getJob, createJob, retryJob, deleteJob } from "./jobs.controller";
import { userRateLimiter } from "../../shared/middleware";

const router = Router();

router.use(authenticate);
router.use(userRateLimiter);

router.get("/", getJobs);
router.get("/:id", getJob);
router.post("/", createJob);
router.post("/:id/retry", retryJob);
router.delete("/:id", deleteJob);

export default router;
