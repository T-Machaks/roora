import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { streamFile } from "@/lib/stream-file";

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

  return streamFile(request, media.path, media.mimeType, media.originalName || media.fileName);
}
