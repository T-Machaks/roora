import Link from "next/link";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { saveMinutes } from "@/lib/actions/minutes";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const metadata = { title: "Minutes" };

export default async function AdminMinutesPage() {
  await requireArea(AdminArea.MINUTES);

  const entries = await db.minutes.findMany({
    orderBy: { meetingDate: "desc" },
    include: { _count: { select: { items: true, pledges: true } } },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Minutes
      </h1>
      <p className="-mt-4 text-sm text-ink-muted">
        Family planning meeting notes and pledges. Visible to admins only —
        never shown on the guest site.
      </p>

      <section className="flex flex-col gap-3">
        {entries.map((m) => (
          <Link
            key={m.id}
            href={`/admin/minutes/${m.id}`}
            className="rounded-xl border border-border bg-surface p-4 hover:border-primary"
          >
            <p className="text-sm text-ink">{m.title}</p>
            <p className="mt-1 text-xs text-ink-muted">
              {new Date(m.meetingDate).toLocaleDateString()}
              {m.venue ? ` · ${m.venue}` : ""} · {m._count.items} item
              {m._count.items === 1 ? "" : "s"} · {m._count.pledges} pledge
              {m._count.pledges === 1 ? "" : "s"}
            </p>
          </Link>
        ))}
        {entries.length === 0 && (
          <p className="text-sm text-ink-muted">No minutes recorded yet.</p>
        )}
      </section>

      <section className="rounded-xl border border-dashed border-border p-4">
        <h2 className="font-display text-lg text-primary">New minutes</h2>
        <form action={saveMinutes} className="mt-3 flex flex-col gap-3">
          <div>
            <Label htmlFor="meetingDate">Meeting date</Label>
            <Input id="meetingDate" name="meetingDate" type="date" required />
          </div>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Pre-lobola meeting"
              required
            />
          </div>
          <div>
            <Label htmlFor="venue">Venue (optional)</Label>
            <Input id="venue" name="venue" />
          </div>
          <div>
            <Label htmlFor="attendees">Attendees (optional)</Label>
            <Input
              id="attendees"
              name="attendees"
              placeholder="Comma-separated names"
            />
          </div>
          <Button type="submit">Create</Button>
        </form>
      </section>
    </div>
  );
}
