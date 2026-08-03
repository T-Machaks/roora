"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { updateUserPermissionsSchema } from "@/lib/validations/admin";

// Only a SUPERADMIN can grant/revoke another admin's area access — same
// invariant as role changes (see updateUserRole): an ADMIN must never be
// able to expand their own or anyone else's admin console access.
export async function updateUserPermissions(formData: FormData) {
  const session = await requireRole([Role.SUPERADMIN]);

  const parsed = updateUserPermissionsSchema.safeParse({
    userId: formData.get("userId"),
    areas: formData.getAll("areas"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  if (parsed.data.userId === session.userId) {
    throw new Error("You cannot change your own permissions.");
  }

  await db.$transaction([
    db.userPermission.deleteMany({ where: { userId: parsed.data.userId } }),
    db.userPermission.createMany({
      data: parsed.data.areas.map((area) => ({ userId: parsed.data.userId, area })),
    }),
  ]);

  revalidatePath("/admin/users");
}
