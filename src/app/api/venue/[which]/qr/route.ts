import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { requireApiSession } from "@/lib/auth";
import { getEventSettings } from "@/lib/settings";
import { directionsUrl } from "@/lib/venue";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ which: string }> }
) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const { which } = await params;
  if (which !== "main" && which !== "after") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const settings = await getEventSettings();
  const url = directionsUrl(
    which === "main"
      ? {
          isTBA: settings.mainVenueIsTBA,
          name: settings.mainVenueName,
          address: settings.mainVenueAddress,
          mapUrl: settings.mainVenueMapUrl,
          lat: settings.mainVenueLat,
          lng: settings.mainVenueLng,
        }
      : {
          isTBA: settings.afterVenueIsTBA,
          name: settings.afterVenueName,
          address: settings.afterVenueAddress,
          mapUrl: settings.afterVenueMapUrl,
          lat: settings.afterVenueLat,
          lng: settings.afterVenueLng,
        }
  );

  if (!url) {
    return NextResponse.json({ error: "No venue set" }, { status: 404 });
  }

  const buffer = await QRCode.toBuffer(url, {
    type: "png",
    width: 400,
    margin: 2,
    color: { dark: "#2A1B12", light: "#FBF7F2" },
  });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
