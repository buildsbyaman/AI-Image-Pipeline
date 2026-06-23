import { Response, NextFunction } from "express";
import { AuthRequest } from "../auth/auth.middleware";
import { Job, File, Result } from "../../database";
import { storageService } from "../files/files.service";
import { safetyCheckQueue } from "./jobs.queue";
import { createResponse } from "../../shared/response";
import { NotFoundError, BadRequestError } from "../../shared/errors";

// Retrieves all jobs owned by the currently authenticated user
export const getJobs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    // Sort by descending creation time (newest first)
    const jobs = await Job.find({ userId }).sort({ createdAt: -1 });
    
    // Stitch each job metadata with its detailed processing results (caption, labels, etc.)
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

// Retrieves a single job and its result fields using its unique database ID
export const getJob = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const id = req.params.id as string;

    if (!userId) {
      throw new BadRequestError("User not authenticated");
    }

    // Scope lookup strictly to the authenticated user's jobs to prevent accessing other users' data
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

// Creates a new media processing job, saves it in PENDING state, and enqueues to the worker
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

    // Verify the file exists, belongs to the active user, and is fully uploaded (confirmed)
    const fileRecord = await File.findOne({ key: fileKey, status: "confirmed" });

    if (!fileRecord || fileRecord.userId?.toString() !== userId) {
      throw new BadRequestError("Invalid file key or file not found");
    }

    // Write initial job record to database
    const job = await Job.create({
      userId,
      fileKey,
      status: "PENDING",
    });

    // Delegate execution by adding the job to the initial queue (Safety Check)
    await safetyCheckQueue.add("safety-check-job", {
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

// Resets a failed or completed job and pushes it back into the initial processing queue
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

    // Clear out any previous pipeline results before re-running
    await Result.deleteMany({ jobId: id });

    // Transition back to PENDING and clear previous error state
    job.status = "PENDING" as any;
    job.error = undefined;
    await job.save();

    // Re-enqueue job to safety check queue
    await safetyCheckQueue.add("safety-check-job", {
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

// Deletes a job record, cleans up associated results, and deletes the file from Cloudflare R2
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

    // Delete related processing outputs
    await Result.deleteMany({ jobId: id });

    // Purge binary payload from R2 storage and database file metadata records
    if (job.fileKey) {
      try {
        await storageService.deleteFile(job.fileKey);
        await File.deleteMany({ key: job.fileKey });
      } catch (storageError) {
        console.error("Failed to delete associated storage files:", storageError);
      }
    }

    // Delete core job metadata
    await Job.findByIdAndDelete(id);

    res.status(200).json(
      createResponse(true, "Job and associated data deleted successfully")
    );
  } catch (error) {
    next(error);
  }
};
