import { Router } from "express";
import { generatePresignedUrl, confirmUpload } from "./file.controller";

const router = Router();

// Route to generate a presigned URL for direct upload
router.post("/presign", generatePresignedUrl);

// Route to confirm upload and save file metadata to DB
router.post("/confirm", confirmUpload);

export default router;
