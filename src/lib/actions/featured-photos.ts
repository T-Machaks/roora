"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { saveUpload, UploadValidationError } from "@/lib/upload";

function revalidateFeaturedViews() {
  revalidatePath("/admin/gallery-featured");
  revalidatePath("/gallery");
}

export async function uploadFeaturedPhoto(formData: FormData) {
  await requireArea(AdminArea.MODERATION);

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new Error("Choose a photo first.");
  }

  const captionRaw = formData.get("caption");
  const caption =
    typeof captionRaw === "string" && captionRaw.trim()
      ? captionRaw.trim().slice(0, 300)
      : null;

  let saved;
  try {
    saved = await saveUpload(file);
  } catch (err) {
    if (err instanceof UploadValidationError) throw new Error(err.message);
    throw err;
  }

  if (saved.type !== "IMAGE") {
    throw new Error("Only images are supported for featured photos.");
  }

  const count = await db.featuredPhoto.count();
  await db.featuredPhoto.create({
    data: {
      path: saved.relativePath,
      mimeType: saved.mimeType,
      caption,
      order: count,
    },
  });

  revalidateFeaturedViews();
}

export async function deleteFeaturedPhoto(formData: FormData) {
  await requireArea(AdminArea.MODERATION);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing photo id");

  await db.featuredPhoto.delete({ where: { id } });

  revalidateFeaturedViews();
}
