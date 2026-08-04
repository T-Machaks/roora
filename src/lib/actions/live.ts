"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { liveAnnouncementSchema } from "@/lib/validations/admin";

export async function postLiveAnnouncement(formData: FormData) {
  await requireArea(AdminArea.SETTINGS);

  const parsed = liveAnnouncementSchema.safeParse({ text: formData.get("text") });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await db.eventSettings.update({
    where: { id: "default" },
    data: { liveAnnouncement: parsed.data.text, liveAnnouncementAt: new Date() },
  });

  revalidatePath("/admin/settings");
}

export async function clearLiveAnnouncement() {
  await requireArea(AdminArea.SETTINGS);

  await db.eventSettings.update({
    where: { id: "default" },
    data: { liveAnnouncement: null, liveAnnouncementAt: null },
  });

  revalidatePath("/admin/settings");
}
