import { customAlphabet } from "nanoid";
import type { Prisma, PrismaClient } from "@/generated/prisma/client";

const suffix = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 5);

export function slugify(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 30);
  return slug || "guest";
}

export async function generateUniqueGuestHandle(
  client: PrismaClient | Prisma.TransactionClient,
  name: string
) {
  const base = slugify(name);
  for (let attempt = 0; attempt < 8; attempt++) {
    const candidate = `${base}-${suffix()}`;
    const existing = await client.user.findUnique({
      where: { guestHandle: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("Could not generate a unique guest handle");
}
