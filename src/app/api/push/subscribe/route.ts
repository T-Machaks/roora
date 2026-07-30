import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";
import { pushSubscriptionSchema } from "@/lib/validations/push";

// Stores the browser's PushManager subscription so a future release can
// send notifications through it — this route does NOT send anything
// itself; actual push delivery is explicitly deferred post-MVP.
export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = pushSubscriptionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await db.pushSubscription.upsert({
    where: { endpoint: parsed.data.endpoint },
    update: { userId: session.userId, p256dh: parsed.data.keys.p256dh, auth: parsed.data.keys.auth },
    create: {
      userId: session.userId,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth,
    },
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const endpoint = body?.endpoint;
  if (typeof endpoint !== "string" || !endpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  await db.pushSubscription.deleteMany({
    where: { endpoint, userId: session.userId },
  });

  return NextResponse.json({ ok: true });
}
