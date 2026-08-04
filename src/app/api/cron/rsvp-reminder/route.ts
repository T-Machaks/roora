import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getEventSettings } from "@/lib/settings";
import { sendPushToAll } from "@/lib/push-send";

// Intended to be hit once a day by a host-level cron job (see README), not
// by guests or the app's own UI — auth is a shared bearer secret rather
// than a session, and it's listed as public in proxy.ts for that reason.
export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const settings = await getEventSettings();
  if (!settings.rsvpDeadline) {
    return NextResponse.json({ ok: true, sentReminder: false, reason: "no deadline set" });
  }

  const daysLeft = Math.ceil(
    (settings.rsvpDeadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );

  let milestone: "3d" | "1d" | null = null;
  if (daysLeft === 3 && !settings.rsvpReminder3dSentAt) milestone = "3d";
  else if (daysLeft === 1 && !settings.rsvpReminder1dSentAt) milestone = "1d";

  if (!milestone) {
    return NextResponse.json({ ok: true, sentReminder: false, daysLeft });
  }

  const result = await sendPushToAll({
    title: "RSVP reminder",
    body: `Just a reminder to RSVP by ${settings.rsvpDeadline.toLocaleDateString("en-GB")} if you haven't already!`,
  });

  await db.eventSettings.update({
    where: { id: "default" },
    data:
      milestone === "3d"
        ? { rsvpReminder3dSentAt: new Date() }
        : { rsvpReminder1dSentAt: new Date() },
  });

  return NextResponse.json({ ok: true, sentReminder: true, milestone, ...result });
}
