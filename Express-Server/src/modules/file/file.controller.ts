import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storageService } from "./file.service";
import { File } from "@imagepipeline/db";
import { createResponse } from "../../shared/utils/response";
import { CustomError } from "../../shared/utils/errors";
import { logger } from "../../shared/utils/logger";

const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

const presignSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required").refine((val) => allowedMimeTypes.includes(val), {
    message: "Only JPG, PNG and WebP formats are supported",
  }),
  fileSize: z.number().positive("File size must be positive").max(5 * 1024 * 1024, "File exceeds 5MB limit"),
});

const confirmSchema = z.object({
  key: z.string().min(1, "Key is required"),
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required").refine((val) => allowedMimeTypes.includes(val), {
    message: "Only JPG, PNG and WebP formats are supported",
  }),
  size: z.number().positive("Size must be positive").max(5 * 1024 * 1024, "File exceeds 5MB limit"),
});

export const generatePresignedUrl = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = presignSchema.parse(req.body);

    const { key, uploadUrl, publicUrl } = await storageService.generatePresignedUrl(
      validatedData.fileName,
      validatedData.mimeType
    );

    res.status(200).json(
      createResponse(true, "Presigned URL generated successfully", {
        key,
        uploadUrl,
        publicUrl,
      })
    );
  } catch (error) {
    next(error);
  }
};

import { AuthRequest } from "../auth/auth.middleware";
import { BadRequestError } from "../../shared/utils/errors";

export const confirmUpload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    const validatedData = confirmSchema.parse(req.body);

    const publicUrl = storageService.getFileUrl(validatedData.key);

    const fileRecord = await File.create({
      userId,
      key: validatedData.key,
      url: publicUrl,
      originalName: validatedData.originalName,
      mimeType: validatedData.mimeType,
      size: validatedData.size,
    });

    res.status(201).json(
      createResponse(true, "File uploaded and recorded successfully", fileRecord)
    );
  } catch (error) {
    next(error);
  }
};

export const serveFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const key = req.params.key as string;

    // Find file metadata in DB to get mimeType
    const fileRecord = await File.findOne({ key });

    const response = await storageService.getFile(key);

    if (fileRecord) {
      res.setHeader("Content-Type", fileRecord.mimeType);
    } else if (response.ContentType) {
      res.setHeader("Content-Type", response.ContentType);
    }

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
