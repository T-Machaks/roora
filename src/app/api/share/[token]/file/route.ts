import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isShareLinkValid } from "@/lib/share";
import { streamFile } from "@/lib/stream-file";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const shareLink = await db.shareLink.findUnique({
    where: { token },
    include: { media: true },
  });

  if (!shareLink || !shareLink.media || !isShareLinkValid(shareLink)) {
    return NextResponse.json({ error: "This link is no longer valid." }, { status: 404 });
  }
  if (shareLink.media.status !== "APPROVED") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const media = shareLink.media;
  return streamFile(request, media.path, media.mimeType, media.originalName || media.fileName);
}
