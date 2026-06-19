import { Router } from "express";
import { generatePresignedUrl, confirmUpload, serveFile } from "./files.controller";
import { authenticate, sseAuthenticate } from "../auth/auth.middleware";

const router = Router();

router.post("/presign", authenticate, generatePresignedUrl);
router.post("/confirm", authenticate, confirmUpload);
router.get("/:key", sseAuthenticate, serveFile);

export default router;
