import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { getRequestBaseUrl } from "@/lib/url";
import { sendMail } from "@/lib/mail";

const GENERIC_MESSAGE =
  "If that email is registered, a reset link has been sent.";

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (!rateLimit(`forgot-password:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json(
      { error: "Too many attempts. Please wait a while and try again." },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const email = parsed.data.email.trim().toLowerCase();
  const user = await db.user.findUnique({ where: { email } });

  // Same response whether or not the email matched, and errors sending
  // the email are swallowed here too — otherwise a distinguishable
  // status/timing would leak which addresses have accounts.
  if (user) {
    try {
      const token = nanoid(32);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      await db.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });

      const link = `${getRequestBaseUrl(request)}/reset-password/${token}`;
      const firstName = user.name.split(" ")[0];

      await sendMail({
        to: email,
        subject: "Reset your password",
        text: `Hi ${firstName},\n\nSomeone requested a password reset for your account. If this was you, set a new password here:\n${link}\n\nThis link expires in 1 hour. If you didn't request this, you can safely ignore this email.`,
        html: `<p>Hi ${firstName},</p><p>Someone requested a password reset for your account. If this was you, set a new password here:</p><p><a href="${link}">${link}</a></p><p>This link expires in 1 hour. If you didn't request this, you can safely ignore this email.</p>`,
      });
    } catch (err) {
      console.error("Failed to send password reset email:", err);
    }
  }

  return NextResponse.json({ ok: true, message: GENERIC_MESSAGE });
}
