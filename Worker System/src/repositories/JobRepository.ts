import { prisma } from "../utils/prisma";

export interface CreateResultParams {
  jobId: string;
  caption: string;
  labels: string[];
  flagged: boolean;
  flaggedCategory?: string;
}

export class JobRepository {
  async updateJobStatus(jobId: string, status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED", error?: string) {
    return prisma.job.update({
      where: { id: jobId },
      data: { status, error },
    });
  }

  async saveResultAndUpdateJob(params: CreateResultParams) {
    return prisma.$transaction(async (tx) => {
      const result = await tx.result.create({
        data: {
          jobId: params.jobId,
          caption: params.caption,
          labels: params.labels,
          flagged: params.flagged,
          flaggedCategory: params.flaggedCategory,
        },
      });

      await tx.job.update({
        where: { id: params.jobId },
        data: { status: "COMPLETED" },
      });

      return result;
    });
  }
}
