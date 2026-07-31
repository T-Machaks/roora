import { randomUUID } from "node:crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { fileTypeFromBuffer } from "file-type";
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  maxUploadBytesFor,
} from "@/lib/constants";
import { MEDIA_PREFIX, s3Bucket, s3Client } from "@/lib/s3";

export class UploadValidationError extends Error {}

export type SavedUpload = {
  fileName: string;
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
  type: "IMAGE" | "VIDEO";
};

/**
 * Validates and persists an uploaded file to S3. The actual file type is
 * sniffed from its magic bytes — the client-supplied Content-Type and
 * original filename/extension are never trusted, so a renamed executable
 * or script can't slip past the extension check. The object is written
 * under a private bucket key only; it's never made public, so it's only
 * reachable through the app's own authenticated/approval-gated routes.
 */
export async function saveUpload(file: File): Promise<SavedUpload> {
  const buffer = Buffer.from(await file.arrayBuffer());

  const sniffed = await fileTypeFromBuffer(buffer);
  if (!sniffed || !ALLOWED_MIME_TYPES.includes(sniffed.mime)) {
    throw new UploadValidationError(
      "Unsupported file type. Please upload a JPEG, PNG, WEBP image, or MP4/MOV video."
    );
  }

  const maxBytes = maxUploadBytesFor(sniffed.mime);
  if (buffer.byteLength > maxBytes) {
    throw new UploadValidationError(
      `File is too large. Maximum size is ${Math.floor(maxBytes / (1024 * 1024))}MB.`
    );
  }

  const type: "IMAGE" | "VIDEO" = ALLOWED_VIDEO_MIME_TYPES.includes(sniffed.mime)
    ? "VIDEO"
    : "IMAGE";

  const year = String(new Date().getFullYear());
  const fileName = `${randomUUID()}.${sniffed.ext}`;
  const key = `${MEDIA_PREFIX}/${year}/${fileName}`;

  await s3Client().send(
    new PutObjectCommand({
      Bucket: s3Bucket(),
      Key: key,
      Body: buffer,
      ContentType: sniffed.mime,
    })
  );

  return {
    fileName,
    relativePath: key,
    mimeType: sniffed.mime,
    sizeBytes: buffer.byteLength,
    type,
  };
}
