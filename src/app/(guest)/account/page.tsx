import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { PasswordForm } from "./password-form";
import { PushSubscribeButton } from "@/components/push-subscribe-button";

export const metadata = { title: "Account" };

export default async function AccountPage() {
  const session = await requireSession();
  const user = await db.user.findUniqueOrThrow({
    where: { id: session.userId },
  });

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Account
      </h1>

      <section className="rounded-xl border border-border bg-surface p-4 text-sm">
        <p className="text-ink">{user.name}</p>
        <p className="mt-1 text-ink-muted">{user.email ?? "No email on file"}</p>
        <p className="mt-1 text-ink-muted">Guest ID: {user.guestHandle}</p>
        <p className="mt-1 text-xs uppercase tracking-wide text-ink-muted">
          {user.role.replaceAll("_", " ")}
        </p>
      </section>

      <section>
        <h2 className="font-display text-lg text-primary">Notifications</h2>
        <div className="mt-3">
          <PushSubscribeButton />
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg text-primary">Change password</h2>
        <div className="mt-3">
          <PasswordForm />
        </div>
      </section>
    </div>
  );
}
