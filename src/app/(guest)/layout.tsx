import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { AccountIcon, LogoutIcon } from "@/components/icons";
import { BottomNav } from "./bottom-nav";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireRole([
    Role.APPROVED_GUEST,
    Role.ADMIN,
    Role.SUPERADMIN,
  ]);

  const isStaff = session.role === Role.ADMIN || session.role === Role.SUPERADMIN;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <Link href="/dashboard" className="font-display text-lg text-primary">
          Blessing &amp; Tessandra
        </Link>
        <div className="flex items-center gap-3">
          {isStaff && (
            <Link
              href="/admin"
              className="text-xs font-medium text-primary underline"
            >
              Admin
            </Link>
          )}
          <Link
            href="/account"
            aria-label="Account"
            className="text-ink-muted hover:text-primary"
          >
            <AccountIcon width={20} height={20} />
          </Link>
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              aria-label="Sign out"
              className="text-ink-muted hover:text-primary"
            >
              <LogoutIcon width={20} height={20} />
            </button>
          </form>
        </div>
      </header>

      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>

      <BottomNav />
    </div>
  );
}
