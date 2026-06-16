import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { storageService } from "../../services/storage.service";
import { prisma } from "../../utils/prisma";
import { createResponse } from "../../utils/response";
import { CustomError } from "../../utils/errors";
import { logger } from "../../utils/logger";

const presignSchema = z.object({
  fileName: z.string().min(1, "File name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  fileSize: z.number().positive("File size must be positive").max(20 * 1024 * 1024, "File exceeds 20MB limit"),
});

const confirmSchema = z.object({
  key: z.string().min(1, "Key is required"),
  originalName: z.string().min(1, "Original name is required"),
  mimeType: z.string().min(1, "MIME type is required"),
  size: z.number().positive("Size must be positive"),
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

export const confirmUpload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = confirmSchema.parse(req.body);

    const publicUrl = storageService.getFileUrl(validatedData.key);

    const fileRecord = await prisma.file.create({
      data: {
        key: validatedData.key,
        url: publicUrl,
        originalName: validatedData.originalName,
        mimeType: validatedData.mimeType,
        size: validatedData.size,
      },
    });

    res.status(201).json(
      createResponse(true, "File uploaded and recorded successfully", fileRecord)
    );
  } catch (error) {
    next(error);
  }
};
