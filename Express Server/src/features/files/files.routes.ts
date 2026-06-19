import { Router } from "express";
import { generatePresignedUrl, confirmUpload, serveFile } from "./files.controller";
import { authenticate } from "../auth/auth.middleware";

const router = Router();

router.post("/presign", authenticate, generatePresignedUrl);
router.post("/confirm", authenticate, confirmUpload);
router.get("/:key", authenticate, serveFile);

export default router;
