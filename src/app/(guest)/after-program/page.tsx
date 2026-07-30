import { db } from "@/lib/db";
import { getEventSettings } from "@/lib/settings";
import { formatEventDate, formatTimeRange } from "@/lib/format";
import { ScheduleTimeline } from "@/components/schedule-timeline";

export const metadata = { title: "After Party" };

export default async function AfterProgramPage() {
  const [settings, items] = await Promise.all([
    getEventSettings(),
    db.scheduleItem.findMany({
      where: { programType: "AFTER_PARTY" },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <section>
        <h1 className="font-display text-2xl font-semibold text-primary">
          After Party
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {formatEventDate(settings.eventDate)}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {settings.afterVenueIsTBA
            ? "Venue to be advised"
            : [settings.afterVenueName, settings.afterVenueAddress]
                .filter(Boolean)
                .join(", ")}
        </p>
        {settings.afterStartTime && (
          <p className="mt-1 text-sm text-ink-muted">
            {formatTimeRange(settings.afterStartTime, settings.afterEndTime)}
          </p>
        )}
      </section>

      <ScheduleTimeline items={items} />
    </div>
  );
}
