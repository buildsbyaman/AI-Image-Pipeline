import { ImageProcessingWorker } from "./modules/job/job.worker";

const startWorker = async () => {
  console.log("AI Processing Worker Microservice started and waiting for jobs...");

  const worker = new ImageProcessingWorker();

  const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}, closing worker gracefully...`);
    await worker.close();
    process.exit(0);
  };

  process.on("SIGINT", () => gracefulShutdown("SIGINT"));
  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
};

startWorker();
