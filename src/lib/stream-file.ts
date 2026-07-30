import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { uploadDir } from "@/lib/constants";

/**
 * Streams a file from UPLOAD_DIR with Range support (needed for video
 * seeking/scrubbing) and optional attachment disposition. Callers are
 * responsible for authorizing the request before calling this — it does
 * no access checks of its own.
 */
export async function streamFile(
  request: Request,
  relativePath: string,
  mimeType: string,
  fileName: string
): Promise<NextResponse> {
  const absolutePath = path.join(/* turbopackIgnore: true */ uploadDir(), relativePath);
  const stats = await stat(absolutePath).catch(() => null);
  if (!stats) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const dispositionType = download ? "attachment" : "inline";

  const range = request.headers.get("range");
  const headers = new Headers({
    "Content-Type": mimeType,
    "Content-Disposition": `${dispositionType}; filename="${fileName.replace(/"/g, "")}"`,
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  });

  if (range) {
    const match = /bytes=(\d*)-(\d*)/.exec(range);
    const start = match?.[1] ? parseInt(match[1], 10) : 0;
    const end = match?.[2] ? parseInt(match[2], 10) : stats.size - 1;
    const chunkSize = end - start + 1;

    headers.set("Content-Range", `bytes ${start}-${end}/${stats.size}`);
    headers.set("Content-Length", String(chunkSize));

    const nodeStream = createReadStream(absolutePath, { start, end });
    return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
      status: 206,
      headers,
    });
  }

  headers.set("Content-Length", String(stats.size));
  const nodeStream = createReadStream(absolutePath);
  return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
    status: 200,
    headers,
  });
}
