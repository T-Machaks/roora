import { S3Client } from "@aws-sdk/client-s3";

// Credentials are never read from env vars here — the AWS SDK's default
// provider chain picks them up automatically (EC2 instance role in
// production, ~/.aws/credentials or AWS_ACCESS_KEY_ID/SECRET locally).
let client: S3Client | null = null;

export function s3Client(): S3Client {
  if (!client) {
    client = new S3Client({ region: process.env.AWS_REGION || "af-south-1" });
  }
  return client;
}

export function s3Bucket(): string {
  const bucket = process.env.S3_BUCKET;
  if (!bucket) throw new Error("S3_BUCKET environment variable is not set");
  return bucket;
}

// All uploaded media lives under this prefix so the bucket can host other
// things later without key collisions.
export const MEDIA_PREFIX = "media";
