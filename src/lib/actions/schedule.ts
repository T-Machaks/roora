"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { scheduleItemSchema } from "@/lib/validations/admin";
import { parseWallClock } from "@/lib/format";

function revalidateScheduleViews() {
  revalidatePath("/admin/schedule");
  revalidatePath("/program");
  revalidatePath("/after-program");
  revalidatePath("/dashboard");
}

export async function saveScheduleItem(formData: FormData) {
  await requireArea(AdminArea.SCHEDULE);

  const id = formData.get("id");
  const parsed = scheduleItemSchema.safeParse({
    programType: formData.get("programType"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime") || undefined,
    order: formData.get("order") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = {
    programType: parsed.data.programType,
    title: parsed.data.title,
    description: parsed.data.description || null,
    startTime: parseWallClock(parsed.data.startTime),
    endTime: parsed.data.endTime ? parseWallClock(parsed.data.endTime) : null,
    order: parsed.data.order,
  };

  if (typeof id === "string" && id) {
    await db.scheduleItem.update({ where: { id }, data });
  } else {
    await db.scheduleItem.create({ data });
  }

  revalidateScheduleViews();
}

export async function deleteScheduleItem(formData: FormData) {
  await requireArea(AdminArea.SCHEDULE);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing schedule item id");

  await db.scheduleItem.delete({ where: { id } });

  revalidateScheduleViews();
}
