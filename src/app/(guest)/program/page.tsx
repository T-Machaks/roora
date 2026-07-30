import { db } from "@/lib/db";
import { getEventSettings } from "@/lib/settings";
import { formatEventDate, formatTimeRange } from "@/lib/format";
import { ScheduleTimeline } from "@/components/schedule-timeline";

export const metadata = { title: "Main Program" };

export default async function ProgramPage() {
  const [settings, items] = await Promise.all([
    getEventSettings(),
    db.scheduleItem.findMany({
      where: { programType: "MAIN" },
      orderBy: { order: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <section>
        <h1 className="font-display text-2xl font-semibold text-primary">
          Main Maroora Program
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {formatEventDate(settings.eventDate)}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {settings.mainVenueIsTBA
            ? "Venue to be advised"
            : [settings.mainVenueName, settings.mainVenueAddress]
                .filter(Boolean)
                .join(", ")}
        </p>
        {settings.mainStartTime && (
          <p className="mt-1 text-sm text-ink-muted">
            {formatTimeRange(settings.mainStartTime, settings.mainEndTime)}
          </p>
        )}
      </section>

      <ScheduleTimeline items={items} />
    </div>
  );
}
