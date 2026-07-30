import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { getEventSettings } from "@/lib/settings";
import { formatEventDate } from "@/lib/format";
import { RsvpForm } from "./rsvp-form";

export const metadata = { title: "RSVP" };

export default async function RsvpPage() {
  const session = await requireSession();
  const [settings, rsvp] = await Promise.all([
    getEventSettings(),
    db.rsvp.findUnique({ where: { userId: session.userId } }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <section>
        <h1 className="font-display text-2xl font-semibold text-primary">
          RSVP
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Please let us know if you&rsquo;ll be joining us on{" "}
          {formatEventDate(settings.eventDate)}
          {settings.rsvpDeadline &&
            ` — kindly respond by ${formatEventDate(settings.rsvpDeadline)}`}
          .
        </p>
      </section>

      <RsvpForm
        initialStatus={rsvp?.status === "NO_RESPONSE" || !rsvp ? "ATTENDING" : rsvp.status}
        initialGuestCount={rsvp?.guestCount ?? 1}
        initialNotes={rsvp?.notes ?? ""}
      />
    </div>
  );
}
