import { headers } from "next/headers";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { createInvite, revokeInvite } from "@/lib/actions/invites";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { CopyButton } from "@/components/ui/copy-button";

// Server Components don't get a raw Request, so this mirrors
// getRequestBaseUrl (src/lib/url.ts) using next/headers instead.
async function getBaseUrl() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto");
  const host = h.get("x-forwarded-host") ?? h.get("host");
  if (proto && host) return `${proto}://${host}`;
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}

export const metadata = { title: "Invites" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Pending",
  REDEEMED: "Redeemed",
  REVOKED: "Revoked",
  EXPIRED: "Expired",
};

export default async function AdminInvitesPage() {
  await requireArea(AdminArea.INVITES);

  const invites = await db.invitation.findMany({
    orderBy: { createdAt: "desc" },
    include: { redeemedBy: { select: { name: true } } },
  });
  const baseUrl = await getBaseUrl();

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h1 className="font-display text-2xl font-semibold text-primary">
          Invites
        </h1>
        <form action={createInvite} className="mt-4 grid max-w-lg gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="guestName">Guest name (optional)</Label>
            <Input id="guestName" name="guestName" />
          </div>
          <div>
            <Label htmlFor="maxGuests">Max guests</Label>
            <Input id="maxGuests" name="maxGuests" type="number" min={1} max={20} defaultValue={1} />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="note">Note (admin only)</Label>
            <Input id="note" name="note" />
          </div>
          <div>
            <Label htmlFor="expiresAt">Expires (optional)</Label>
            <Input id="expiresAt" name="expiresAt" type="date" />
          </div>
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Create invite
            </Button>
          </div>
        </form>
      </section>

      <section className="flex flex-col gap-4">
        {invites.length === 0 && (
          <p className="text-sm text-ink-muted">No invites yet.</p>
        )}
        {invites.map((invite) => {
          const link = `${baseUrl}/redeem/${invite.token}`;
          return (
            <div
              key={invite.id}
              className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/invites/${invite.id}/qr`}
                  alt={`QR code for invite ${invite.code}`}
                  width={72}
                  height={72}
                  className="rounded-md border border-border"
                />
                <div>
                  <p className="font-mono text-sm tracking-widest text-ink">
                    {invite.code}
                  </p>
                  <p className="text-sm text-ink">
                    {invite.guestName || "Unnamed invite"} · {invite.maxGuests}{" "}
                    guest{invite.maxGuests === 1 ? "" : "s"}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {STATUS_LABEL[invite.status]}
                    {invite.redeemedBy && ` by ${invite.redeemedBy.name}`}
                    {invite.note && ` · ${invite.note}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton value={link} />
                {invite.status === "PENDING" && (
                  <form action={revokeInvite}>
                    <input type="hidden" name="id" value={invite.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-700 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-700 hover:text-white"
                    >
                      Revoke
                    </button>
                  </form>
                )}
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
