import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env";
import { v4 as uuidv4 } from "uuid";
import path from "path";

// Initialize S3 Client for Cloudflare R2
const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const storageService = {
  async generatePresignedUrl(originalName: string, mimeType: string): Promise<{ key: string; uploadUrl: string; publicUrl: string }> {
    const extension = path.extname(originalName);
    const uniqueKey = `${uuidv4()}${extension}`;

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: uniqueKey,
      ContentType: mimeType,
    });

    // Generate a presigned URL valid for 15 minutes
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    return {
      key: uniqueKey,
      uploadUrl,
      publicUrl: this.getFileUrl(uniqueKey),
    };
  },

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
  },

  getFileUrl(key: string): string {
    return `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.R2_BUCKET_NAME}/${key}`;
  },
};
