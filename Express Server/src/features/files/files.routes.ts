import { Router } from "express";
import { generatePresignedUrl, confirmUpload, serveFile } from "./files.controller";
import { authenticate, sseAuthenticate } from "../auth/auth.middleware";
import { userRateLimiter } from "../../shared/middleware";

const router = Router();

router.post("/presign", authenticate, userRateLimiter, generatePresignedUrl);
router.post("/confirm", authenticate, userRateLimiter, confirmUpload);
router.get("/:key", sseAuthenticate, serveFile);


export default router;
