import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { GalleryGridItem } from "@/components/gallery-grid-item";
import { PlayIcon } from "@/components/icons";
import { UploadForm } from "./upload-form";

export const metadata = { title: "Gallery" };

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting review",
  APPROVED: "Live in gallery",
  REJECTED: "Not approved",
  HIDDEN: "Hidden by hosts",
};

function Thumb({ id, type }: { id: string; type: "IMAGE" | "VIDEO" }) {
  const src = `/api/media/file/${id}`;
  if (type === "IMAGE") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />;
  }
  return (
    <div className="relative h-full w-full">
      {/* No server-side thumbnail extraction (no ffmpeg in the image) —
          the #t= fragment is a browser-only seek hint, never sent to the
          server, so this relies purely on Range support in streamFile. */}
      <video
        src={`${src}#t=0.1`}
        preload="metadata"
        muted
        playsInline
        className="h-full w-full object-cover"
      />
      <span className="absolute inset-0 flex items-center justify-center bg-black/20">
        <PlayIcon width={28} height={28} className="text-white drop-shadow" />
      </span>
    </div>
  );
}

export default async function GalleryPage() {
  const session = await requireSession();

  const [approved, mine, featured] = await Promise.all([
    db.media.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 60,
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
                  <Thumb id={m.id} type={m.type} />
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
        {approved.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No memories have been shared yet — be the first!
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-2">
            {approved.map((m, i) => (
              <GalleryGridItem
                key={m.id}
                href={`/gallery/${m.id}`}
                index={i}
                className="aspect-square overflow-hidden rounded-lg border border-border block"
              >
                <Thumb id={m.id} type={m.type} />
              </GalleryGridItem>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
