import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { uploadFeaturedPhoto, deleteFeaturedPhoto } from "@/lib/actions/featured-photos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Featured gallery" };

export default async function AdminGalleryFeaturedPage() {
  await requireArea(AdminArea.MODERATION);

  const photos = await db.featuredPhoto.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-primary">
          Featured gallery
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Curated &ldquo;Moments of Us&rdquo; photos shown at the top of the guest
          gallery — always visible, no moderation needed.
        </p>
      </div>

      <form
        action={uploadFeaturedPhoto}
        className="flex flex-col gap-3 rounded-xl border border-dashed border-border p-4"
      >
        <input type="file" name="file" accept="image/jpeg,image/png,image/webp" required />
        <Input name="caption" placeholder="Caption (optional)" maxLength={300} />
        <Button type="submit" className="self-start">
          Add photo
        </Button>
      </form>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((photo) => (
          <div key={photo.id} className="flex flex-col gap-2">
            <div className="aspect-square overflow-hidden rounded-lg border border-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/api/featured-photos/${photo.id}/file`}
                alt={photo.caption ?? ""}
                className="h-full w-full object-cover"
              />
            </div>
            {photo.caption && <p className="text-xs text-ink-muted">{photo.caption}</p>}
            <form action={deleteFeaturedPhoto}>
              <input type="hidden" name="id" value={photo.id} />
              <button type="submit" className="text-xs text-red-700 underline">
                Delete
              </button>
            </form>
          </div>
        ))}
        {photos.length === 0 && (
          <p className="col-span-full text-sm text-ink-muted">
            No featured photos yet.
          </p>
        )}
      </div>
    </div>
  );
}
