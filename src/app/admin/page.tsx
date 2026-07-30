import Link from "next/link";
import { db } from "@/lib/db";

export const metadata = { title: "Admin Overview" };

async function getStats() {
  const [
    pendingInvites,
    redeemedInvites,
    attending,
    maybe,
    notAttending,
    noResponse,
    pendingMedia,
  ] = await Promise.all([
    db.invitation.count({ where: { status: "PENDING" } }),
    db.invitation.count({ where: { status: "REDEEMED" } }),
    db.rsvp.count({ where: { status: "ATTENDING" } }),
    db.rsvp.count({ where: { status: "MAYBE" } }),
    db.rsvp.count({ where: { status: "NOT_ATTENDING" } }),
    db.rsvp.count({ where: { status: "NO_RESPONSE" } }),
    db.media.count({ where: { status: "PENDING" } }),
  ]);
  return {
    pendingInvites,
    redeemedInvites,
    attending,
    maybe,
    notAttending,
    noResponse,
    pendingMedia,
  };
}

function StatCard({ label, value, href }: { label: string; value: number; href?: string }) {
  const content = (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-2xl font-semibold text-primary">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{label}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

export default async function AdminOverviewPage() {
  const stats = await getStats();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Overview
      </h1>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Invites pending" value={stats.pendingInvites} href="/admin/invites" />
        <StatCard label="Invites redeemed" value={stats.redeemedInvites} href="/admin/invites" />
        <StatCard label="Attending" value={stats.attending} href="/admin/rsvps" />
        <StatCard label="Maybe" value={stats.maybe} href="/admin/rsvps" />
        <StatCard label="Not attending" value={stats.notAttending} href="/admin/rsvps" />
        <StatCard label="No response yet" value={stats.noResponse} href="/admin/rsvps" />
        <StatCard label="Media awaiting review" value={stats.pendingMedia} href="/admin/moderation" />
      </div>
    </div>
  );
}
