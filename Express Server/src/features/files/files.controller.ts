import { Response, NextFunction } from "express";
import { z } from "zod";
import { storageService } from "./files.service";
import { File } from "../../database";
import { createResponse } from "../../shared/response";
import { BadRequestError } from "../../shared/errors";
import { logger } from "../../shared/logger";
import { AuthRequest } from "../auth/auth.middleware";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const presignSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required").refine((val) => allowedMimeTypes.includes(val), {
    message: "Only JPG, PNG and WebP formats are supported",
  }),
  fileSize: z.number().positive("File size must be positive").max(5 * 1024 * 1024, "File exceeds 5MB limit"),
  contentHash: z.string().optional(),
});

const confirmSchema = z.object({
  key: z.string().min(1, "Key is required"),
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required").refine((val) => allowedMimeTypes.includes(val), {
    message: "Only JPG, PNG and WebP formats are supported",
  }),
  size: z.number().positive("Size must be positive").max(5 * 1024 * 1024, "File exceeds 5MB limit"),
});

export const generatePresignedUrl = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    const validatedData = presignSchema.parse(req.body);
    const { contentHash } = validatedData;

    // --- Deduplication check ---
    // If the frontend provides a content hash, check whether an identical confirmed
    // file already exists (from any user). If so, skip the R2 upload entirely.
    if (contentHash) {
      const existingFile = await File.findOne({ contentHash, status: "confirmed" });

      if (existingFile) {
        // Create a new confirmed File record for this user pointing at the shared R2 key.
        // This gives the user their own ownership record without duplicating storage.
        await File.create({
          userId,
          key: existingFile.key,
          url: existingFile.url,
          mimeType: validatedData.mimeType,
          originalName: validatedData.fileName,
          size: validatedData.fileSize,
          status: "confirmed",
          contentHash,
        });

        logger.info(`[Dedup] Hash ${contentHash} matched existing key ${existingFile.key} for user ${userId}`);

        return res.status(200).json(
          createResponse(true, "Duplicate image detected — reusing existing upload", {
            key: existingFile.key,
            uploadUrl: null,
            publicUrl: existingFile.url,
            alreadyUploaded: true,
          })
        );
      }
    }

    // --- Normal path: generate a new presigned URL ---
    const { key, uploadUrl, publicUrl } = await storageService.generatePresignedUrl(
      validatedData.fileName,
      validatedData.mimeType
    );

    // Create a 'pending' file record tied to this user BEFORE returning the upload URL.
    // This atomically binds the key to its owner — no other user can claim this key
    // at /confirm time, and orphaned uploads (no confirm called) are identifiable.
    await File.create({
      userId,
      key,
      url: publicUrl,
      mimeType: validatedData.mimeType,
      status: "pending",
      contentHash: contentHash || undefined,
    });

    res.status(200).json(
      createResponse(true, "Presigned URL generated successfully", {
        key,
        uploadUrl,
        publicUrl,
        alreadyUploaded: false,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const confirmUpload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    const validatedData = confirmSchema.parse(req.body);

    // Find the pending record created at presign time, scoped to this user.
    // If the record doesn't exist for this userId, the key was either never
    // presigned by this user, or another user is attempting to claim it.
    const pendingFile = await File.findOne({ key: validatedData.key, userId, status: "pending" });

    if (!pendingFile) {
      throw new BadRequestError("Invalid key — no pending upload found for your account");
    }

    // Promote the record from pending → confirmed and fill in the real metadata
    pendingFile.originalName = validatedData.originalName;
    pendingFile.size = validatedData.size;
    pendingFile.mimeType = validatedData.mimeType;
    pendingFile.status = "confirmed";
    await pendingFile.save();

    res.status(201).json(
      createResponse(true, "File uploaded and recorded successfully", pendingFile)
    );
  } catch (error) {
    next(error);
  }
};


export const serveFile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    const key = req.params.key as string;

    // Ownership check: ensure this file belongs to the authenticated user
    const fileRecord = await File.findOne({ key, userId });

    if (!fileRecord) {
      return res.status(404).send("File not found");
    }

    const response = await storageService.getFile(key);

    res.setHeader("Content-Type", fileRecord.mimeType);

    if (response.ContentLength !== undefined) {
      res.setHeader("Content-Length", response.ContentLength);
    }

    if (response.Body && typeof (response.Body as any).pipe === "function") {
      (response.Body as any).pipe(res);
    } else {
      res.status(404).send("File body not found or not streamable");
    }
  } catch (error: any) {
    if (error.name === "NoSuchKey" || error.code === "NoSuchKey") {
      res.status(404).send("File not found in storage");
      return;
    }
    next(error);
  }
};

