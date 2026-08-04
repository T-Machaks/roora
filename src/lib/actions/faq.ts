"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireArea } from "@/lib/auth";
import { AdminArea } from "@/generated/prisma/enums";
import { faqItemSchema } from "@/lib/validations/admin";

function revalidateFaqViews() {
  revalidatePath("/admin/faq");
  revalidatePath("/faq");
}

export async function saveFaqItem(formData: FormData) {
  await requireArea(AdminArea.SETTINGS);

  const id = formData.get("id");
  const parsed = faqItemSchema.safeParse({
    question: formData.get("question"),
    answer: formData.get("answer"),
    order: formData.get("order") || undefined,
    visible: formData.get("visible") === "on",
  });
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid input");
  }

  if (typeof id === "string" && id) {
    await db.faqItem.update({ where: { id }, data: parsed.data });
  } else {
    await db.faqItem.create({ data: parsed.data });
  }

  revalidateFaqViews();
}

export async function deleteFaqItem(formData: FormData) {
  await requireArea(AdminArea.SETTINGS);

  const id = formData.get("id");
  if (typeof id !== "string" || !id) throw new Error("Missing FAQ item id");

  await db.faqItem.delete({ where: { id } });

  revalidateFaqViews();
}
