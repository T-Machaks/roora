import { getEventSettings } from "@/lib/settings";
import { formatEventDate, daysUntil } from "@/lib/format";
import { Countdown } from "@/components/countdown";
import { Reveal } from "@/components/reveal";
import { Tile } from "@/components/ui/tile";
import {
  ProgramIcon,
  AfterPartyIcon,
  RsvpIcon,
  GalleryIcon,
  DressCodeIcon,
  ContactIcon,
  VenueIcon,
  FaqIcon,
} from "@/components/icons";

export const metadata = { title: "Home" };

export default async function DashboardPage() {
  const settings = await getEventSettings();
  const days = daysUntil(settings.eventDate);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <Reveal>
        <section className="rounded-2xl border border-border bg-surface p-6 text-center">
          <p className="font-display text-sm uppercase tracking-[0.3em] text-ink-muted">
            Maroora Celebration
          </p>
          <h1 className="font-display mt-2 text-2xl font-semibold text-primary">
            {settings.groomName} &amp; {settings.brideName}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {formatEventDate(settings.eventDate)}
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            {settings.mainVenueIsTBA
              ? "Venue to be advised"
              : settings.mainVenueName}
          </p>
          {days > 0 && (
            <p className="mt-4 inline-block rounded-full bg-secondary px-4 py-1 text-sm font-medium text-primary-dark">
              {days} {days === 1 ? "day" : "days"} to go
            </p>
          )}
          {days === 0 && (
            <p className="mt-4 inline-block rounded-full bg-secondary px-4 py-1 text-sm font-medium text-primary-dark">
              It&rsquo;s today!
            </p>
          )}
          <div className="mt-4">
            <Countdown eventDate={settings.eventDate} />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1} className="grid grid-cols-2 gap-3">
        <Tile
          href="/program"
          icon={<ProgramIcon />}
          label="Main Program"
          sublabel="Maroora schedule"
        />
        <Tile
          href="/after-program"
          icon={<AfterPartyIcon />}
          label="After Party"
          sublabel="Celebration schedule"
        />
        <Tile href="/rsvp" icon={<RsvpIcon />} label="RSVP" sublabel="Let us know" />
        <Tile
          href="/gallery"
          icon={<GalleryIcon />}
          label="Gallery"
          sublabel="Photos & videos"
        />
        <Tile
          href="/dress-code"
          icon={<DressCodeIcon />}
          label="Dress Code"
          sublabel="All black"
        />
        <Tile
          href="/venue"
          icon={<VenueIcon />}
          label="Venue"
          sublabel="Map & directions"
        />
        <Tile
          href="/faq"
          icon={<FaqIcon />}
          label="FAQ"
          sublabel="Common questions"
        />
        <Tile
          href="/contact"
          icon={<ContactIcon />}
          label="Contact"
          sublabel="Reach the hosts"
        />
      </Reveal>
    </div>
  );
}
