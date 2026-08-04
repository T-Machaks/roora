"use server";

import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { announcementSchema } from "@/lib/validations/admin";
import { sendPushToAll } from "@/lib/push-send";

export async function sendAnnouncement(formData: FormData) {
  await requireArea(AdminArea.SETTINGS);

  const parsed = announcementSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await sendPushToAll({ title: parsed.data.title, body: parsed.data.body });
}
