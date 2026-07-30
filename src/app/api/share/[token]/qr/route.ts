import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { db } from "@/lib/db";
import { isShareLinkValid } from "@/lib/share";
import { getRequestBaseUrl } from "@/lib/url";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const shareLink = await db.shareLink.findUnique({ where: { token } });
  if (!shareLink || !isShareLinkValid(shareLink)) {
    return NextResponse.json({ error: "This link is no longer valid." }, { status: 404 });
  }

  const url = `${getRequestBaseUrl(request)}/share/${token}`;

  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 512,
    margin: 2,
    color: { dark: "#2A1B12", light: "#FBF7F2" },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
      "Content-Disposition": `attachment; filename="share-${token.slice(0, 8)}.png"`,
    },
  });
}
