import { Readable } from "node:stream";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { s3Bucket, s3Client } from "@/lib/s3";

/**
 * Streams a file from S3 with Range support (needed for video
 * seeking/scrubbing) and optional attachment disposition. Callers are
 * responsible for authorizing the request before calling this — it does
 * no access checks of its own, and the underlying S3 object is private
 * (never a public URL), so this route is the only way to read it back.
 */
export async function streamFile(
  request: Request,
  key: string,
  mimeType: string,
  fileName: string
): Promise<NextResponse> {
  const download = new URL(request.url).searchParams.get("download") === "1";
  const dispositionType = download ? "attachment" : "inline";
  const range = request.headers.get("range") ?? undefined;

  let object;
  try {
    object = await s3Client().send(
      new GetObjectCommand({ Bucket: s3Bucket(), Key: key, Range: range })
    );
  } catch (err) {
    const name = (err as { name?: string })?.name;
    if (name === "NoSuchKey" || name === "NotFound") {
      return NextResponse.json({ error: "File missing" }, { status: 404 });
    }
    throw err;
  }

  const headers = new Headers({
    "Content-Type": mimeType,
    "Content-Disposition": `${dispositionType}; filename="${fileName.replace(/"/g, "")}"`,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  });
  if (object.ContentLength != null) {
    headers.set("Content-Length", String(object.ContentLength));
  }
  if (object.ContentRange) {
    headers.set("Content-Range", object.ContentRange);
  }

  const body = Readable.toWeb(object.Body as Readable) as ReadableStream;
  return new NextResponse(body, {
    status: range && object.ContentRange ? 206 : 200,
    headers,
  });
}
