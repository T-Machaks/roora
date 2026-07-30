import { InviteEnvelope } from "@/components/invite-envelope";
import { RedeemForm } from "./redeem-form";

export const metadata = { title: "Enter invite code" };

export default function RedeemPage() {
  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16">
      <InviteEnvelope subtitle="Blessing & Tessandra · 24 October">
        <div className="flex flex-col items-center text-center">
          <h1 className="font-display text-3xl font-semibold text-primary">
            You&rsquo;re invited
          </h1>
          <p className="mt-2 max-w-sm text-sm text-ink-muted">
            Enter the invite code you were given to create your account and
            view the celebration details.
          </p>
          <div className="mt-8 w-full">
            <RedeemForm />
          </div>
        </div>
      </InviteEnvelope>
    </div>
  );
}
