"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { updateUserRoleSchema } from "@/lib/validations/admin";

// Role changes (especially promotion to ADMIN/SUPERADMIN) are restricted to
// SUPERADMIN only — an ADMIN must never be able to grant themselves or
// anyone else elevated privileges.
export async function updateUserRole(formData: FormData) {
  const session = await requireRole([Role.SUPERADMIN]);

  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  if (parsed.data.userId === session.userId) {
    throw new Error("You cannot change your own role.");
  }

  await db.user.update({
    where: { id: parsed.data.userId },
    data: { role: parsed.data.role },
  });

  revalidatePath("/admin/users");
}
