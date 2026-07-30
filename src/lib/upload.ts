import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileTypeFromBuffer } from "file-type";
import {
  ALLOWED_MIME_TYPES,
  ALLOWED_VIDEO_MIME_TYPES,
  maxUploadBytesFor,
  uploadDir,
} from "@/lib/constants";

export class UploadValidationError extends Error {}

export type SavedUpload = {
  fileName: string;
  relativePath: string;
  mimeType: string;
  sizeBytes: number;
  type: "IMAGE" | "VIDEO";
};

/**
 * Validates and persists an uploaded file to local disk. The actual file
 * type is sniffed from its magic bytes — the client-supplied Content-Type
 * and original filename/extension are never trusted, so a renamed
 * executable or script can't slip past the extension check.
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
  const relativePath = path.posix.join(year, fileName);

  const absoluteDir = path.join(uploadDir(), year);
  await mkdir(absoluteDir, { recursive: true });
  await writeFile(path.join(uploadDir(), year, fileName), buffer);

  return {
    fileName,
    relativePath,
    mimeType: sniffed.mime,
    sizeBytes: buffer.byteLength,
    type,
  };
}
