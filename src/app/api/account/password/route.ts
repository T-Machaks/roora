import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { requireApiSession } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations/account";

export async function POST(request: Request) {
  const session = await requireApiSession();
  if (session instanceof NextResponse) return session;

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(
    parsed.data.currentPassword,
    user.passwordHash
  );
  if (!valid) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}
