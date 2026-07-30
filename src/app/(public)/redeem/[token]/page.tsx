import Link from "next/link";
import { db } from "@/lib/db";
import { InviteEnvelope } from "@/components/invite-envelope";
import { RedeemForm } from "../redeem-form";

export const metadata = { title: "Enter invite code" };

export default async function RedeemTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invitation = await db.invitation.findUnique({ where: { token } });

  const isValid = !!invitation && invitation.status === "PENDING";

  if (!isValid) {
    return (
      <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-primary">
          This invite link isn&rsquo;t valid
        </h1>
        <p className="mt-2 max-w-sm text-sm text-ink-muted">
          It may have already been used or has expired. If you have an invite
          code, you can enter it manually below.
        </p>
        <Link
          href="/redeem"
          className="mt-6 text-sm font-medium text-primary underline"
        >
          Enter invite code manually
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16">
      <InviteEnvelope
        title={invitation.guestName ? `Welcome, ${invitation.guestName}` : "You're Invited"}
        subtitle="Blessing & Tessandra · 24 October"
      >
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display text-3xl font-semibold text-primary">
            {invitation.guestName ? `Welcome, ${invitation.guestName}` : "You’re invited"}
          </h1>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Complete your details below to create your account and view the
            celebration.
          </p>
          <div className="mt-8 w-full">
            <RedeemForm initialIdentifier={token} lockIdentifier />
          </div>
        </div>
      </InviteEnvelope>
    </div>
  );
}
