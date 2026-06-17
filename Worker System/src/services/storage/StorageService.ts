import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { env } from "../../config/env";

export class StorageService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: "auto",
      endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });
  }

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
