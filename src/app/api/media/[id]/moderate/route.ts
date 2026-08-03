import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { moderateActionSchema } from "@/lib/validations/media";

const STATUS_FOR_ACTION: Record<string, "APPROVED" | "REJECTED" | "HIDDEN"> = {
  APPROVE: "APPROVED",
  REJECT: "REJECTED",
  HIDE: "HIDDEN",
  UNHIDE: "APPROVED",
};

// SUPERADMIN always may moderate; an ADMIN needs the MODERATION area
// explicitly granted (see /admin/users) — enforced here independently of
// whatever the page/proxy already checked.
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireApiArea(AdminArea.MODERATION);
  if (session instanceof NextResponse) return session;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = moderateActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const media = await db.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newStatus = STATUS_FOR_ACTION[parsed.data.action];

  await db.$transaction([
    db.media.update({
      where: { id },
      data: {
        status: newStatus,
        moderatedById: session.userId,
        moderatedAt: new Date(),
      },
    }),
    db.moderationLog.create({
      data: {
        actorId: session.userId,
        targetType: "MEDIA",
        targetId: id,
        action: parsed.data.action,
        reason: parsed.data.reason || null,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, status: newStatus });
}
