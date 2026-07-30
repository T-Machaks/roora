import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { loginSchema } from "@/lib/validations/auth";

// bcrypt hash of a random unguessable string; used to keep response timing
// similar whether or not the identifier matches a real account.
const DUMMY_HASH =
  "$2a$12$CwTycUXWue0Thq9StjUM0uJ8Uus9UkT/j6JMLdrY6HG8vDHnyf.aC";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { identifier, password } = parsed.data;
  const user = await db.user.findFirst({
    where: { OR: [{ email: identifier }, { guestHandle: identifier }] },
  });

  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.name = user.name;
  await session.save();

  return NextResponse.json({ ok: true, role: user.role });
}
