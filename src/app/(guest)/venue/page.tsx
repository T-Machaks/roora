import { getEventSettings } from "@/lib/settings";
import { formatEventTime } from "@/lib/format";
import { directionsUrl, type VenueInfo } from "@/lib/venue";

export const metadata = { title: "Venue" };

function VenueSection({
  title,
  venue,
  startTime,
  endTime,
  qrPath,
}: {
  title: string;
  venue: VenueInfo;
  startTime: Date | null;
  endTime: Date | null;
  qrPath: string;
}) {
  if (venue.isTBA) {
    return (
      <section className="rounded-xl border border-border bg-surface p-4">
        <h2 className="font-display text-lg text-primary">{title}</h2>
        <p className="mt-2 text-sm text-ink-muted">Venue details coming soon.</p>
      </section>
    );
  }

  const directions = directionsUrl(venue);

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-display text-lg text-primary">{title}</h2>

      {venue.mapUrl && (
        <div className="mt-3 aspect-video w-full overflow-hidden rounded-lg border border-border">
          <iframe
            src={venue.mapUrl}
            title={`${title} map`}
            className="h-full w-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      )}

      <div className="mt-3">
        {venue.name && <p className="text-sm font-medium text-ink">{venue.name}</p>}
        {venue.address && <p className="text-sm text-ink-muted">{venue.address}</p>}
        {startTime && (
          <p className="mt-1 text-sm text-ink-muted">
            {formatEventTime(startTime)}
            {endTime && ` – ${formatEventTime(endTime)}`}
          </p>
        )}
      </div>

      {directions && (
        <div className="mt-4 flex flex-wrap items-center gap-4">
          <a
            href={directions}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium tracking-wide text-secondary transition-colors hover:bg-primary-dark"
          >
            Get directions
          </a>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={qrPath}
            alt={`QR code for directions to ${title}`}
            width={96}
            height={96}
            className="rounded-lg border border-border"
          />
        </div>
      )}
    </section>
  );
}

export default async function VenuePage() {
  const settings = await getEventSettings();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-primary">Venue</h1>

      <VenueSection
        title="Main maroora"
        venue={{
          isTBA: settings.mainVenueIsTBA,
          name: settings.mainVenueName,
          address: settings.mainVenueAddress,
          mapUrl: settings.mainVenueMapUrl,
          lat: settings.mainVenueLat,
          lng: settings.mainVenueLng,
        }}
        startTime={settings.mainStartTime}
        endTime={settings.mainEndTime}
        qrPath="/api/venue/main/qr"
      />

      <VenueSection
        title="After party"
        venue={{
          isTBA: settings.afterVenueIsTBA,
          name: settings.afterVenueName,
          address: settings.afterVenueAddress,
          mapUrl: settings.afterVenueMapUrl,
          lat: settings.afterVenueLat,
          lng: settings.afterVenueLng,
        }}
        startTime={settings.afterStartTime}
        endTime={settings.afterEndTime}
        qrPath="/api/venue/after/qr"
      />
    </div>
  );
}
