import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const comment = await db.comment.findUnique({ where: { id } });
  if (!comment) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isOwner = comment.authorId === session.userId;
  const isStaff = session.role === Role.ADMIN || session.role === Role.SUPERADMIN;
  if (!isOwner && !isStaff) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.comment.delete({ where: { id } });

  if (isStaff && !isOwner) {
    await db.moderationLog.create({
      data: {
        actorId: session.userId,
        targetType: "COMMENT",
        targetId: id,
        action: "DELETE",
      },
    });
  }

  return NextResponse.json({ ok: true });
}
