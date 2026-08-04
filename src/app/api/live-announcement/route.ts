import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/auth";
import { getEventSettings } from "@/lib/settings";

// Auto-hides after this long even if an admin forgets to clear it — keeps
// a stale "ceremony starting in 5 minutes" from haunting the app for days.
const MAX_AGE_MS = 3 * 60 * 60 * 1000;

export async function GET() {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const settings = await getEventSettings();
  if (!settings.liveAnnouncement || !settings.liveAnnouncementAt) {
    return NextResponse.json({ announcement: null });
  }

  const age = Date.now() - settings.liveAnnouncementAt.getTime();
  if (age > MAX_AGE_MS) {
    return NextResponse.json({ announcement: null });
  }

  return NextResponse.json({
    announcement: {
      text: settings.liveAnnouncement,
      postedAt: settings.liveAnnouncementAt.toISOString(),
    },
  });
}
