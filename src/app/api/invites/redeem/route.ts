import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redeemSchema } from "@/lib/validations/auth";
import { generateUniqueGuestHandle } from "@/lib/handle";
import { getClientIp, rateLimit } from "@/lib/rate-limit";

const ERROR_RESPONSES: Record<string, { status: number; error: string }> = {
  INVITE_NOT_FOUND: { status: 404, error: "Invite code not found." },
  INVITE_NOT_AVAILABLE: {
    status: 409,
    error: "This invite has already been used or is no longer valid.",
  },
  INVITE_EXPIRED: { status: 409, error: "This invite has expired." },
  EMAIL_TAKEN: { status: 409, error: "That email is already registered." },
};

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`redeem:${ip}`, 10, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a while and try again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = redeemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { identifier, name, email, password } = parsed.data;
  const normalizedEmail = email ? email.trim().toLowerCase() : null;

  try {
    const user = await db.$transaction(async (tx) => {
      // Re-validated inside the transaction (not just before it) so two
      // simultaneous redemptions of the same invite can't both succeed.
      const invitation = await tx.invitation.findFirst({
        where: {
          OR: [
            { code: identifier.trim().toUpperCase() },
            { token: identifier.trim() },
          ],
        },
      });

      if (!invitation) throw new Error("INVITE_NOT_FOUND");
      if (invitation.status !== "PENDING") throw new Error("INVITE_NOT_AVAILABLE");
      if (invitation.expiresAt && invitation.expiresAt < new Date()) {
        throw new Error("INVITE_EXPIRED");
      }

      if (normalizedEmail) {
        const existingEmail = await tx.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (existingEmail) throw new Error("EMAIL_TAKEN");
      }

      const guestHandle = await generateUniqueGuestHandle(tx, name);
      const passwordHash = await bcrypt.hash(password, 12);

      const createdUser = await tx.user.create({
        data: {
          name,
          email: normalizedEmail,
          guestHandle,
          passwordHash,
          role: invitation.roleGrant,
        },
      });

      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: "REDEEMED",
          redeemedById: createdUser.id,
          redeemedAt: new Date(),
        },
      });

      return createdUser;
    });

    const session = await getSession();
    session.userId = user.id;
    session.role = user.role;
    session.name = user.name;
    await session.save();

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "UNKNOWN";
    const mapped = ERROR_RESPONSES[message] ?? {
      status: 500,
      error: "Something went wrong. Please try again.",
    };
    return NextResponse.json({ error: mapped.error }, { status: mapped.status });
  }
}
