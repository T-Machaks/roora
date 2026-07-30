import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isShareLinkValid } from "@/lib/share";

export const metadata = {
  title: "Shared memory",
  robots: { index: false, follow: false },
};

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const shareLink = await db.shareLink.findUnique({
    where: { token },
    include: { media: true },
  });

  if (!shareLink || !shareLink.media || !isShareLinkValid(shareLink) || shareLink.media.status !== "APPROVED") {
    notFound();
  }

  await db.shareLink.update({
    where: { id: shareLink.id },
    data: { viewCount: { increment: 1 } },
  });

  const media = shareLink.media;
  const src = `/api/share/${token}/file`;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 py-16">
      <p className="font-display text-sm uppercase tracking-[0.3em] text-ink-muted">
        Shared from Blessing &amp; Tessandra&rsquo;s Maroora
      </p>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface">
        {media.type === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={media.caption ?? "Shared memory"} className="w-full object-cover" />
        ) : (
          <video src={src} controls className="w-full" />
        )}
      </div>

      {media.caption && (
        <p className="max-w-sm text-center text-sm text-ink-muted">{media.caption}</p>
      )}

      <a
        href={`${src}?download=1`}
        className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium tracking-wide text-secondary hover:bg-primary-dark"
      >
        Download
      </a>
    </div>
  );
}
