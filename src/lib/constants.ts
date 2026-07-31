export const ALLOWED_IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const ALLOWED_VIDEO_MIME_TYPES = ["video/mp4", "video/quicktime"];
export const ALLOWED_MIME_TYPES = [
  ...ALLOWED_IMAGE_MIME_TYPES,
  ...ALLOWED_VIDEO_MIME_TYPES,
];

export function maxUploadBytesFor(mime: string): number {
  const imageMb = Number(process.env.MAX_UPLOAD_IMAGE_MB || 15);
  const videoMb = Number(process.env.MAX_UPLOAD_VIDEO_MB || 200);
  const mb = ALLOWED_VIDEO_MIME_TYPES.includes(mime) ? videoMb : imageMb;
  return mb * 1024 * 1024;
}
