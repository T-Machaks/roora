import { requireSession } from "@/lib/auth";

export const metadata = { title: "Pending approval" };

export default async function PendingPage() {
  const session = await requireSession();

  return (
    <div className="flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-16 text-center">
      <h1 className="font-display text-2xl font-semibold text-primary">
        Almost there, {session.name.split(" ")[0]}
      </h1>
      <p className="mt-2 max-w-sm text-sm text-ink-muted">
        Your account is waiting on approval from the hosts before you can
        view the celebration details. This usually doesn&rsquo;t take long —
        please check back soon.
      </p>
      <form action="/api/auth/logout" method="post" className="mt-6">
        <button
          type="submit"
          className="text-sm font-medium text-primary underline"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
