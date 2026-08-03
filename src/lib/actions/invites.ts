"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { generateInviteCode, generateInviteToken } from "@/lib/invite";
import { createInviteSchema } from "@/lib/validations/admin";

export async function createInvite(formData: FormData) {
  const session = await requireArea(AdminArea.INVITES);

  const parsed = createInviteSchema.safeParse({
    guestName: formData.get("guestName") || undefined,
    maxGuests: formData.get("maxGuests") || undefined,
    note: formData.get("note") || undefined,
    expiresAt: formData.get("expiresAt") || undefined,
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  await db.invitation.create({
    data: {
      code: generateInviteCode(),
      token: generateInviteToken(),
      guestName: parsed.data.guestName || null,
      maxGuests: parsed.data.maxGuests,
      note: parsed.data.note || null,
      expiresAt: parsed.data.expiresAt ?? null,
      createdById: session.userId,
    },
  });

  revalidatePath("/admin/invites");
}

export async function revokeInvite(formData: FormData) {
  await requireArea(AdminArea.INVITES);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing invite id");

  await db.invitation.update({
    where: { id },
    data: { status: "REVOKED" },
  });

  revalidatePath("/admin/invites");
}
