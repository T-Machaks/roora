import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";
import { rsvpSchema } from "@/lib/validations/rsvp";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = rsvpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { status, guestCount, notes } = parsed.data;

  const rsvp = await db.rsvp.upsert({
    where: { userId: session.userId },
    update: { status, guestCount, notes, respondedAt: new Date() },
    create: {
      userId: session.userId,
      status,
      guestCount,
      notes,
      respondedAt: new Date(),
    },
  });

  return NextResponse.json({ ok: true, rsvp });
}
