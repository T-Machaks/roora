import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { uploadDir } from "@/lib/constants";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const media = await db.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwnerOrStaff =
    media.uploaderId === session.userId ||
    session.role === Role.ADMIN ||
    session.role === Role.SUPERADMIN;
  const isViewableApproved = media.status === "APPROVED";

  if (!isViewableApproved && !isOwnerOrStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const absolutePath = path.join(uploadDir(), media.path);
  const stats = await stat(absolutePath).catch(() => null);
  if (!stats) {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }

  const download = new URL(request.url).searchParams.get("download") === "1";
  const dispositionType = download ? "attachment" : "inline";
  const fileName = media.originalName || media.fileName;

  const range = request.headers.get("range");
  const headers = new Headers({
    "Content-Type": media.mimeType,
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
    return new NextResponse(
      Readable.toWeb(nodeStream) as ReadableStream,
      { status: 206, headers }
    );
  }

  headers.set("Content-Length", String(stats.size));
  const nodeStream = createReadStream(absolutePath);
  return new NextResponse(Readable.toWeb(nodeStream) as ReadableStream, {
    status: 200,
    headers,
  });
}
