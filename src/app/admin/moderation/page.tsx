import Link from "next/link";
import { db } from "@/lib/db";
import { ModerationActions } from "./moderation-actions";

export const metadata = { title: "Moderation" };

function MediaPreview({ id, type, caption }: { id: string; type: "IMAGE" | "VIDEO"; caption: string | null }) {
  const src = `/api/media/file/${id}`;
  return (
    <div className="w-40 shrink-0">
      {type === "IMAGE" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={caption ?? "Uploaded media"} className="h-40 w-40 rounded-lg object-cover" />
      ) : (
        <video src={src} controls className="h-40 w-40 rounded-lg object-cover" />
      )}
    </div>
  );
}

export default async function AdminModerationPage() {
  const [pending, recent] = await Promise.all([
    db.media.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: { uploader: { select: { name: true } } },
    }),
    db.media.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { moderatedAt: "desc" },
      take: 12,
      include: { uploader: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-semibold text-primary">
          Moderation
        </h1>
        <Link href="/admin/moderation/logs" className="text-xs font-medium text-primary underline">
          View log
        </Link>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
          Pending review ({pending.length})
        </h2>
        {pending.length === 0 && (
          <p className="text-sm text-ink-muted">Nothing waiting for review.</p>
        )}
        {pending.map((m) => (
          <div key={m.id} className="flex gap-4 rounded-xl border border-border bg-surface p-4">
            <MediaPreview id={m.id} type={m.type} caption={m.caption} />
            <div className="flex flex-1 flex-col justify-between">
              <div>
                <p className="text-sm text-ink">{m.uploader.name}</p>
                {m.caption && <p className="text-sm text-ink-muted">{m.caption}</p>}
                <p className="text-xs text-ink-muted">
                  {new Date(m.createdAt).toLocaleString()}
                </p>
              </div>
              <ModerationActions mediaId={m.id} />
            </div>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
          Recently moderated
        </h2>
        {recent.length === 0 && (
          <p className="text-sm text-ink-muted">No moderation activity yet.</p>
        )}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {recent.map((m) => (
            <div key={m.id} className="flex flex-col gap-1">
              <MediaPreview id={m.id} type={m.type} caption={m.caption} />
              <p className="text-[10px] uppercase tracking-wide text-ink-muted">
                {m.status}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
