import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import { Job, File, Result } from "@imagepipeline/db";
import { storageService } from "../file/file.service";
import { imageProcessingQueue } from "./job.queue";
import { createResponse } from "../../shared/utils/response";
import { NotFoundError, BadRequestError } from "../../shared/utils/errors";

export const getJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    
    // Fetch related results
    const jobsWithResults = await Promise.all(
      jobs.map(async (job) => {
        const result = await Result.findOne({ jobId: job._id });
        return {
          ...job.toJSON(),
          caption: result?.caption,
          labels: result?.labels,
          flagged: result?.flagged,
          flaggedCategory: result?.flaggedCategory,
          result: result ? result.toJSON() : null,
        };
      })
    );

    res.status(200).json(createResponse(true, "Jobs retrieved successfully", jobsWithResults));
  } catch (error) {
    next(error);
  }
};

export const getJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    const job = await Job.findOne({ _id: id, userId });

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    const result = await Result.findOne({ jobId: job._id });

    res.status(200).json(createResponse(true, "Job retrieved successfully", {
      ...job.toJSON(),
      caption: result?.caption,
      labels: result?.labels,
      flagged: result?.flagged,
      flaggedCategory: result?.flaggedCategory,
      result: result ? result.toJSON() : null,
    }));
  } catch (error) {
    next(error);
  }
};

export const createJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    const { fileKey } = req.body;
    if (!fileKey) {
      throw new BadRequestError("File key is required");
    }

    const fileRecord = await File.findOne({ key: fileKey });

    if (!fileRecord || fileRecord.userId?.toString() !== userId) {
      // NOTE: fileRecord.userId might be undefined depending on how it's uploaded
      // Previously Prisma was fileRecord.userId !== userId.
      throw new BadRequestError("Invalid file key or file not found");
    }

    // 1. Create Job
    const job = await Job.create({
      userId,
      fileKey,
      status: "PENDING",
    });

    // 2. Queue the job for background processing
    await imageProcessingQueue.add("image-process-job", {
      jobId: job.id,
      userId,
      fileKey,
      email: req.user?.email,
      firstName: req.user?.firstName,
    });

    res.status(201).json(
      createResponse(true, "Job created and queued successfully", {
        jobId: job.id,
        status: job.status,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const retryJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    const job = await Job.findOne({ _id: id, userId });

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    // 1. Delete associated Result record if it exists
    await Result.deleteMany({ jobId: id });

    // 2. Reset Job status
    job.status = "PENDING" as any;
    job.error = undefined;
    await job.save();

    // 3. Re-queue the job
    await imageProcessingQueue.add("image-process-job", {
      jobId: job.id,
      userId,
      fileKey: job.fileKey,
      email: req.user?.email,
      firstName: req.user?.firstName,
    });

    res.status(200).json(
      createResponse(true, "Job requeued successfully", {
        jobId: job.id,
        status: job.status,
      })
    );
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    const job = await Job.findOne({ _id: id, userId });

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    // 1. Delete associated Result record if it exists
    await Result.deleteMany({ jobId: id });

    // 2. Delete file from R2 and DB if it exists
    if (job.fileKey) {
      try {
        await storageService.deleteFile(job.fileKey);
        await File.deleteMany({ key: job.fileKey });
      } catch (storageError) {
        console.error("Failed to delete associated storage files:", storageError);
      }
    }

    // 3. Delete the Job record
    await Job.findByIdAndDelete(id);

    res.status(200).json(
      createResponse(true, "Job and associated data deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};
