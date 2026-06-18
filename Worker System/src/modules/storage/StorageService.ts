import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../config/env";

// Handles streaming and downloading media files from Cloudflare R2 storage buckets
export class StorageService {
  private s3Client: S3Client;

  constructor() {
    // R2 utilizes the S3 client protocol but uses Account ID endpoint mappings.
    // Region is auto-detected at the edge by Cloudflare.
    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
      requestChecksumCalculation: "WHEN_REQUIRED",
    });
  }

  // Pulls a file from R2 and streams chunks sequentially to assemble an in-memory binary Buffer
  async downloadImageBuffer(fileKey: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: fileKey,
    });

    const response = await this.s3Client.send(command);
    
    if (!response.Body) {
      throw new Error("Failed to retrieve image body from storage.");
    }
    
    const stream = response.Body as unknown as NodeJS.ReadableStream;
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on("error", (err) => reject(err));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }
}
