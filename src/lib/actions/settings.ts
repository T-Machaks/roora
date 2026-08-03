"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import {
  eventSettingsSchema,
  contactPersonSchema,
} from "@/lib/validations/admin";
import { parseWallClock } from "@/lib/format";

function revalidateSettingsViews() {
  revalidatePath("/admin/settings");
  revalidatePath("/dashboard");
  revalidatePath("/program");
  revalidatePath("/after-program");
  revalidatePath("/dress-code");
  revalidatePath("/rsvp");
  revalidatePath("/", "layout");
}

export async function updateEventSettings(formData: FormData) {
  await requireArea(AdminArea.SETTINGS);

  const parsed = eventSettingsSchema.safeParse({
    brideName: formData.get("brideName"),
    groomName: formData.get("groomName"),
    eventDate: formData.get("eventDate"),
    mainVenueIsTBA: formData.get("mainVenueIsTBA") === "on",
    mainVenueName: formData.get("mainVenueName") || undefined,
    mainVenueAddress: formData.get("mainVenueAddress") || undefined,
    mainStartTime: formData.get("mainStartTime") || undefined,
    mainEndTime: formData.get("mainEndTime") || undefined,
    afterVenueIsTBA: formData.get("afterVenueIsTBA") === "on",
    afterVenueName: formData.get("afterVenueName") || undefined,
    afterVenueAddress: formData.get("afterVenueAddress") || undefined,
    afterStartTime: formData.get("afterStartTime") || undefined,
    afterEndTime: formData.get("afterEndTime") || undefined,
    dressCode: formData.get("dressCode"),
    themePrimaryColor: formData.get("themePrimaryColor"),
    themeSecondaryColor: formData.get("themeSecondaryColor"),
    rsvpDeadline: formData.get("rsvpDeadline") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }
  const d = parsed.data;

  await db.eventSettings.update({
    where: { id: "default" },
    data: {
      brideName: d.brideName,
      groomName: d.groomName,
      eventDate: new Date(d.eventDate),
      mainVenueIsTBA: d.mainVenueIsTBA,
      mainVenueName: d.mainVenueName || null,
      mainVenueAddress: d.mainVenueAddress || null,
      mainStartTime: d.mainStartTime ? parseWallClock(d.mainStartTime) : null,
      mainEndTime: d.mainEndTime ? parseWallClock(d.mainEndTime) : null,
      afterVenueIsTBA: d.afterVenueIsTBA,
      afterVenueName: d.afterVenueName || null,
      afterVenueAddress: d.afterVenueAddress || null,
      afterStartTime: d.afterStartTime ? parseWallClock(d.afterStartTime) : null,
      afterEndTime: d.afterEndTime ? parseWallClock(d.afterEndTime) : null,
      dressCode: d.dressCode,
      themePrimaryColor: d.themePrimaryColor,
      themeSecondaryColor: d.themeSecondaryColor,
      rsvpDeadline: d.rsvpDeadline ? new Date(d.rsvpDeadline) : null,
    },
  });

  revalidateSettingsViews();
}

export async function createContact(formData: FormData) {
  await requireArea(AdminArea.SETTINGS);

  const parsed = contactPersonSchema.safeParse({
    name: formData.get("name"),
    role: formData.get("role"),
    phone: formData.get("phone") || undefined,
    email: formData.get("email") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  const count = await db.contactPerson.count();
  await db.contactPerson.create({
    data: {
      name: parsed.data.name,
      role: parsed.data.role,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      order: count,
    },
  });

  revalidatePath("/admin/settings");
  revalidatePath("/contact");
}

export async function deleteContact(formData: FormData) {
  await requireArea(AdminArea.SETTINGS);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing contact id");

  await db.contactPerson.delete({ where: { id } });

  revalidatePath("/admin/settings");
  revalidatePath("/contact");
}
