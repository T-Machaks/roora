import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
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
  return type === "IMAGE" ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className="h-full w-full object-cover" loading="lazy" />
  ) : (
    <video src={src} className="h-full w-full object-cover" muted />
  );
}

export default async function GalleryPage() {
  const session = await requireSession();

  const [approved, mine] = await Promise.all([
    db.media.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 60,
    }),
    db.media.findMany({
      where: { uploaderId: session.userId, status: { not: "APPROVED" } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-8">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Memories
      </h1>

      <UploadForm />

      {mine.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
            My uploads
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {mine.map((m) => (
              <div key={m.id} className="flex flex-col gap-1">
                <div className="aspect-square overflow-hidden rounded-lg border border-border">
                  <Thumb id={m.id} type={m.type} />
                </div>
                <p className="text-[10px] text-ink-muted">{STATUS_LABEL[m.status]}</p>
              </div>
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
            {approved.map((m) => (
              <div key={m.id} className="aspect-square overflow-hidden rounded-lg border border-border">
                <Thumb id={m.id} type={m.type} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
