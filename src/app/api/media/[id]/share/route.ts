import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireApiRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { generateShareToken } from "@/lib/share";
import { getRequestBaseUrl } from "@/lib/url";

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
  const media = await db.media.findUnique({ where: { id } });
  if (!media || media.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Only approved memories can be shared." },
      { status: 403 }
    );
  }

  const shareLink = await db.shareLink.create({
    data: {
      token: generateShareToken(),
      scope: "SINGLE_MEDIA",
      mediaId: id,
      createdById: session.userId,
    },
  });

  return NextResponse.json({
    ok: true,
    url: `${getRequestBaseUrl(request)}/share/${shareLink.token}`,
    qrUrl: `/api/share/${shareLink.token}/qr`,
  });
}
