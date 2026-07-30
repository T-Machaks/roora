import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { commentSchema } from "@/lib/validations/media";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiRole([
    Role.APPROVED_GUEST,
    Role.ADMIN,
    Role.SUPERADMIN,
  ]);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const media = await db.media.findUnique({ where: { id } });
  if (!media || media.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Comments are only open on approved memories." },
      { status: 403 }
    );
  }

  const comment = await db.comment.create({
    data: {
      mediaId: id,
      authorId: session.userId,
      body: parsed.data.body,
    },
    include: { author: { select: { name: true } } },
  });

  return NextResponse.json({ ok: true, comment });
}
