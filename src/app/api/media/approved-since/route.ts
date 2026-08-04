import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const since = new URL(request.url).searchParams.get("since");
  const sinceDate = since ? new Date(since) : null;
  if (!sinceDate || Number.isNaN(sinceDate.getTime())) {
    return NextResponse.json({ error: "Invalid or missing 'since'" }, { status: 400 });
  }

  const items = await db.media.findMany({
    where: { status: "APPROVED", createdAt: { gt: sinceDate } },
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, type: true, createdAt: true },
  });

  return NextResponse.json({ items });
}
