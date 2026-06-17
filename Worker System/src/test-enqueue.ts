import { prisma } from "./utils/prisma";
import { Queue } from "bullmq";
import { connection } from "./queues/connection";
import { ImageProcessingPayload } from "./workers/ImageProcessingWorker";

async function main() {
  console.log("Setting up database test records...");
  
  // 1. Get or create a test user
  let user = await prisma.user.findFirst();
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "test-worker@example.com",
        passwordHash: "dummyhash",
        firstName: "Test",
        lastName: "User",
      },
    });
    console.log(`Created test user: ${user.email} (${user.id})`);
  } else {
    console.log(`Using existing user: ${user.email} (${user.id})`);
  }

  // 2. Locate or create a file key to process.
  // Note: For R2 downloading to succeed, this file key should actually exist in your R2 bucket.
  // If not, the worker will download it and fail with a NoSuchKey/404 error from AWS S3,
  // which is a good way to verify the storage service pipeline works!
  let file = await prisma.file.findFirst();
  let fileKey = file?.key || "test-image-key.jpg";

  if (!file) {
    console.log(`No files found in database. Using default key: ${fileKey}`);
  } else {
    console.log(`Using existing file key from database: ${fileKey}`);
  }

  // 3. Create a test job in the database
  const jobRecord = await prisma.job.create({
    data: {
      userId: user.id,
      fileKey: fileKey,
      status: "PENDING",
    },
  });
  console.log(`Created database Job record: ${jobRecord.id}`);

  // 4. Enqueue the BullMQ job
  console.log("Connecting to Redis and enqueuing BullMQ job...");
  const queue = new Queue<ImageProcessingPayload>("image-processing", { connection: connection as any });
  
  const payload: ImageProcessingPayload = {
    jobId: jobRecord.id,
    userId: user.id,
    fileKey: fileKey,
  };

  const job = await queue.add("image-process-job", payload);
  console.log(`Successfully enqueued job ${job.id} with payload:`, payload);

  await queue.close();
  await prisma.$disconnect();
  console.log("Done!");
}

main().catch((err) => {
  console.error("Failed to enqueue test job:", err);
  process.exit(1);
});
