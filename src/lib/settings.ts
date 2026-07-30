import { db } from "@/lib/db";

/**
 * EventSettings is a singleton row (id "default"), seeded on first boot.
 * Reading it fresh on every render (rather than caching) is what lets a
 * superadmin change venue/theme/dress-code from /admin/settings and have
 * it show up immediately, with no redeploy.
 */
export async function getEventSettings() {
  const settings = await db.eventSettings.findUnique({
    where: { id: "default" },
  });
  if (!settings) {
    throw new Error(
      "EventSettings has not been seeded. Run `npm run seed` first."
    );
  }
  return settings;
}
