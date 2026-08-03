"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import {
  minutesSchema,
  minutesItemSchema,
  pledgeSchema,
} from "@/lib/validations/admin";

export async function saveMinutes(formData: FormData) {
  const session = await requireArea(AdminArea.MINUTES);

  const id = formData.get("id");
  const parsed = minutesSchema.safeParse({
    meetingDate: formData.get("meetingDate"),
    title: formData.get("title"),
    venue: formData.get("venue") || undefined,
    attendees: formData.get("attendees") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const data = {
    meetingDate: new Date(parsed.data.meetingDate),
    title: parsed.data.title,
    venue: parsed.data.venue || null,
    attendees: parsed.data.attendees || null,
  };

  if (typeof id === "string" && id) {
    await db.minutes.update({ where: { id }, data });
    revalidatePath("/admin/minutes");
    revalidatePath(`/admin/minutes/${id}`);
    return;
  }

  const created = await db.minutes.create({
    data: { ...data, createdById: session.userId },
  });
  revalidatePath("/admin/minutes");
  redirect(`/admin/minutes/${created.id}`);
}

export async function deleteMinutes(formData: FormData) {
  await requireArea(AdminArea.MINUTES);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing minutes id");

  await db.minutes.delete({ where: { id } });

  revalidatePath("/admin/minutes");
  redirect("/admin/minutes");
}

export async function saveMinutesItem(formData: FormData) {
  await requireArea(AdminArea.MINUTES);

  const id = formData.get("id");
  const parsed = minutesItemSchema.safeParse({
    minutesId: formData.get("minutesId"),
    text: formData.get("text"),
    order: formData.get("order") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  if (typeof id === "string" && id) {
    await db.minutesItem.update({
      where: { id },
      data: { text: parsed.data.text, order: parsed.data.order },
    });
  } else {
    await db.minutesItem.create({ data: parsed.data });
  }

  revalidatePath(`/admin/minutes/${parsed.data.minutesId}`);
}

export async function deleteMinutesItem(formData: FormData) {
  await requireArea(AdminArea.MINUTES);

  const id = formData.get("id");
  const minutesId = formData.get("minutesId");
  if (typeof id !== "string" || !id) throw new Error("Missing item id");

  await db.minutesItem.delete({ where: { id } });

  if (typeof minutesId === "string" && minutesId) {
    revalidatePath(`/admin/minutes/${minutesId}`);
  }
}

export async function savePledge(formData: FormData) {
  await requireArea(AdminArea.MINUTES);

  const id = formData.get("id");
  const parsed = pledgeSchema.safeParse({
    minutesId: formData.get("minutesId"),
    pledgerName: formData.get("pledgerName"),
    description: formData.get("description"),
    order: formData.get("order") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  if (typeof id === "string" && id) {
    await db.pledge.update({
      where: { id },
      data: {
        pledgerName: parsed.data.pledgerName,
        description: parsed.data.description,
        order: parsed.data.order,
      },
    });
  } else {
    await db.pledge.create({ data: parsed.data });
  }

  revalidatePath(`/admin/minutes/${parsed.data.minutesId}`);
}

export async function deletePledge(formData: FormData) {
  await requireArea(AdminArea.MINUTES);

  const id = formData.get("id");
  const minutesId = formData.get("minutesId");
  if (typeof id !== "string" || !id) throw new Error("Missing pledge id");

  await db.pledge.delete({ where: { id } });

  if (typeof minutesId === "string" && minutesId) {
    revalidatePath(`/admin/minutes/${minutesId}`);
  }
}
