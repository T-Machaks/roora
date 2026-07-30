"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HomeIcon,
  ProgramIcon,
  AfterPartyIcon,
  RsvpIcon,
  GalleryIcon,
} from "@/components/icons";

const TABS = [
  { href: "/dashboard", label: "Home", Icon: HomeIcon },
  { href: "/program", label: "Program", Icon: ProgramIcon },
  { href: "/after-program", label: "After", Icon: AfterPartyIcon },
  { href: "/rsvp", label: "RSVP", Icon: RsvpIcon },
  { href: "/gallery", label: "Gallery", Icon: GalleryIcon },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {TABS.map(({ href, label, Icon }) => {
          const active =
            pathname === href || (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-1 py-2 text-[11px] ${
                  active ? "text-primary" : "text-ink-muted"
                }`}
              >
                <Icon width={20} height={20} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
