import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { Role } from "@/generated/prisma/enums";
import { LogoutIcon } from "@/components/icons";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/invites", label: "Invites" },
  { href: "/admin/rsvps", label: "RSVPs" },
  { href: "/admin/schedule", label: "Schedule" },
  { href: "/admin/moderation", label: "Moderation" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole([Role.ADMIN, Role.SUPERADMIN]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
        <Link href="/admin" className="font-display text-lg text-primary">
          Admin
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs font-medium text-primary underline">
            Guest site
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

      <nav className="overflow-x-auto border-b border-border bg-surface px-4">
        <ul className="flex min-w-max gap-4 text-sm">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="inline-block py-3 text-ink-muted hover:text-primary"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <main className="flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
