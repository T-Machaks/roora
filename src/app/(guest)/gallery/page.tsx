import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { GalleryGridItem } from "@/components/gallery-grid-item";
import { MediaThumb } from "@/components/media-thumb";
import { LiveApprovedGrid } from "@/components/live-approved-grid";
import { UploadForm } from "./upload-form";

export const metadata = { title: "Gallery" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting review",
  APPROVED: "Live in gallery",
  REJECTED: "Not approved",
  HIDDEN: "Hidden by hosts",
};

export default async function GalleryPage() {
  const session = await requireSession();

  const [approved, mine, featured] = await Promise.all([
    db.media.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 60,
      select: { id: true, type: true, createdAt: true },
    }),
    db.media.findMany({
      where: { uploaderId: session.userId, status: { not: "APPROVED" } },
      orderBy: { createdAt: "desc" },
    }),
    db.featuredPhoto.findMany({ orderBy: { order: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Memories
      </h1>

      {featured.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
            Moments of Us
          </h2>
          <div className="flex snap-x gap-3 overflow-x-auto pb-1">
            {featured.map((photo) => (
              <figure
                key={photo.id}
                className="w-40 shrink-0 snap-start overflow-hidden rounded-xl border border-border"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/featured-photos/${photo.id}/file`}
                  alt={photo.caption ?? ""}
                  className="aspect-square w-full object-cover"
                  loading="lazy"
                />
                {photo.caption && (
                  <figcaption className="px-2 py-1.5 text-xs text-ink-muted">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      <UploadForm />

      {mine.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
            My uploads
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {mine.map((m, i) => (
              <GalleryGridItem
                key={m.id}
                href={`/gallery/${m.id}`}
                index={i}
                className="flex flex-col gap-1"
              >
                <div className="aspect-square overflow-hidden rounded-lg border border-border">
                  <MediaThumb id={m.id} type={m.type} />
                </div>
                <p className="text-[10px] text-ink-muted">{STATUS_LABEL[m.status]}</p>
              </GalleryGridItem>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
          Approved memories
        </h2>
        <LiveApprovedGrid
          initialItems={approved.map((m) => ({
            id: m.id,
            type: m.type,
            createdAt: m.createdAt.toISOString(),
          }))}
        />
      </section>
    </div>
  );
}
