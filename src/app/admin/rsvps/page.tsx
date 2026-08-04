import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { DIETARY_OPTIONS, decodeDietaryNeeds } from "@/lib/validations/rsvp";

export const metadata = { title: "RSVPs" };

const STATUS_LABEL: Record<string, string> = {
  ATTENDING: "Attending",
  MAYBE: "Maybe",
  NOT_ATTENDING: "Not attending",
  NO_RESPONSE: "No response",
};

function dietarySummaryLabel(options: string[], other: string | null) {
  const parts = [...options];
  if (other) parts.push(`Other: ${other}`);
  return parts.length > 0 ? parts.join(", ") : "—";
}

export default async function AdminRsvpsPage() {
  await requireArea(AdminArea.RSVPS);

  const rsvps = await db.rsvp.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { name: true, email: true, guestHandle: true } } },
  });

  const totalGuests = rsvps
    .filter((r) => r.status === "ATTENDING")
    .reduce((sum, r) => sum + r.guestCount, 0);

  const dietaryCounts: Record<string, number> = Object.fromEntries(
    DIETARY_OPTIONS.map((o) => [o, 0])
  );
  const otherDietary: string[] = [];
  for (const r of rsvps) {
    const dietary = decodeDietaryNeeds(r.dietaryNeeds);
    for (const option of dietary.options) {
      dietaryCounts[option] = (dietaryCounts[option] ?? 0) + 1;
    }
    if (dietary.other) otherDietary.push(dietary.other);
  }
  const hasDietaryNeeds = Object.values(dietaryCounts).some((c) => c > 0) || otherDietary.length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary">
          RSVPs
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          {totalGuests} confirmed guest{totalGuests === 1 ? "" : "s"} attending
        </p>
      </div>

      {hasDietaryNeeds && (
        <div className="rounded-xl border border-border bg-surface p-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
            Dietary summary
          </h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIETARY_OPTIONS.filter((o) => dietaryCounts[o] > 0).map((option) => (
              <span
                key={option}
                className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary-dark"
              >
                {option}: {dietaryCounts[option]}
              </span>
            ))}
            {otherDietary.map((o, i) => (
              <span
                key={i}
                className="rounded-full border border-border px-3 py-1 text-xs text-ink"
              >
                {o}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="py-2 pr-4">Guest</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Count</th>
              <th className="py-2 pr-4">Song request</th>
              <th className="py-2 pr-4">Dietary</th>
              <th className="py-2 pr-4">Notes</th>
              <th className="py-2">Responded</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => {
              const dietary = decodeDietaryNeeds(r.dietaryNeeds);
              return (
                <tr key={r.id} className="border-b border-border/60">
                  <td className="py-2 pr-4">
                    <p className="text-ink">{r.user.name}</p>
                    <p className="text-xs text-ink-muted">
                      {r.user.email ?? r.user.guestHandle}
                    </p>
                  </td>
                  <td className="py-2 pr-4">{STATUS_LABEL[r.status]}</td>
                  <td className="py-2 pr-4">{r.guestCount}</td>
                  <td className="py-2 pr-4 text-ink-muted">{r.songRequest ?? "—"}</td>
                  <td className="py-2 pr-4 text-ink-muted">
                    {dietarySummaryLabel(dietary.options, dietary.other)}
                  </td>
                  <td className="py-2 pr-4 text-ink-muted">{r.notes ?? "—"}</td>
                  <td className="py-2 text-ink-muted">
                    {r.respondedAt
                      ? new Date(r.respondedAt).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              );
            })}
            {rsvps.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-ink-muted">
                  No RSVPs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
