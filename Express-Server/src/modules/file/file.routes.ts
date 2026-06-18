import { Router } from "express";
import { generatePresignedUrl, confirmUpload, serveFile } from "./file.controller";
import { authenticate } from "../auth/auth.middleware";

const router = Router();

// Route to generate a presigned URL for direct upload
router.post("/presign", authenticate, generatePresignedUrl);

// Route to confirm upload and save file metadata to DB
router.post("/confirm", authenticate, confirmUpload);

// Route to stream/serve the file directly from storage
router.get("/:key", serveFile);

export default router;
