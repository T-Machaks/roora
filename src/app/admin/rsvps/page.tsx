import { db } from "@/lib/db";

export const metadata = { title: "RSVPs" };

const STATUS_LABEL: Record<string, string> = {
  ATTENDING: "Attending",
  MAYBE: "Maybe",
  NOT_ATTENDING: "Not attending",
  NO_RESPONSE: "No response",
};

export default async function AdminRsvpsPage() {
  const rsvps = await db.rsvp.findMany({
    orderBy: { updatedAt: "desc" },
    include: { user: { select: { name: true, email: true, guestHandle: true } } },
  });

  const totalGuests = rsvps
    .filter((r) => r.status === "ATTENDING")
    .reduce((sum, r) => sum + r.guestCount, 0);

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

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-muted">
              <th className="py-2 pr-4">Guest</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Count</th>
              <th className="py-2 pr-4">Notes</th>
              <th className="py-2">Responded</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => (
              <tr key={r.id} className="border-b border-border/60">
                <td className="py-2 pr-4">
                  <p className="text-ink">{r.user.name}</p>
                  <p className="text-xs text-ink-muted">
                    {r.user.email ?? r.user.guestHandle}
                  </p>
                </td>
                <td className="py-2 pr-4">{STATUS_LABEL[r.status]}</td>
                <td className="py-2 pr-4">{r.guestCount}</td>
                <td className="py-2 pr-4 text-ink-muted">{r.notes ?? "—"}</td>
                <td className="py-2 text-ink-muted">
                  {r.respondedAt
                    ? new Date(r.respondedAt).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
            {rsvps.length === 0 && (
              <tr>
                <td colSpan={5} className="py-6 text-center text-ink-muted">
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
