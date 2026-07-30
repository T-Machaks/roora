import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { CommentSection } from "./comment-section";
import { ShareSection } from "./share-section";

export const metadata = { title: "Memory" };

export default async function MediaDetailPage({
  params,
}: {
  params: Promise<{ mediaId: string }>;
}) {
  const session = await requireSession();
  const { mediaId } = await params;

  const media = await db.media.findUnique({
    where: { id: mediaId },
    include: {
      uploader: { select: { name: true } },
      comments: {
        orderBy: { createdAt: "asc" },
        include: { author: { select: { name: true } } },
      },
    },
  });

  if (!media) notFound();

  const isStaff = session.role === Role.ADMIN || session.role === Role.SUPERADMIN;
  const isOwner = media.uploaderId === session.userId;
  if (media.status !== "APPROVED" && !isOwner && !isStaff) notFound();

  const src = `/api/media/file/${media.id}`;

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <Link href="/gallery" className="text-sm text-primary underline">
        &larr; Back to gallery
      </Link>

      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        {media.type === "IMAGE" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={media.caption ?? ""} className="w-full object-cover" />
        ) : (
          <video src={src} controls className="w-full" />
        )}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-ink">{media.uploader.name}</p>
          {media.caption && <p className="text-sm text-ink-muted">{media.caption}</p>}
        </div>
        {media.status === "APPROVED" && (
          <a
            href={`${src}?download=1`}
            className="text-xs font-medium text-primary underline"
          >
            Download
          </a>
        )}
      </div>

      {media.status !== "APPROVED" && (
        <p className="rounded-lg bg-secondary/40 p-3 text-xs text-primary-dark">
          {media.status === "PENDING"
            ? "This memory is awaiting review and is only visible to you."
            : `This memory is ${media.status.toLowerCase()} and isn't visible to other guests.`}
        </p>
      )}

      {media.status === "APPROVED" && (
        <>
          <ShareSection mediaId={media.id} />
          <CommentSection
            mediaId={media.id}
            initialComments={media.comments
              .filter((c) => !c.hidden)
              .map((c) => ({
                id: c.id,
                body: c.body,
                author: c.author,
                createdAt: c.createdAt.toISOString(),
                canDelete: c.authorId === session.userId || isStaff,
              }))}
          />
        </>
      )}
    </div>
  );
}
