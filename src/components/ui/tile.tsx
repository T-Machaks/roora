import Link from "next/link";
import type { ReactNode } from "react";

export function Tile({
  href,
  icon,
  label,
  sublabel,
}: {
  href: string;
  icon: ReactNode;
  label: string;
  sublabel?: string;
}) {
  return (
    <Link
      href={href}
      className="flex flex-col items-start gap-2 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary"
    >
      <span className="text-primary">{icon}</span>
      <span className="text-sm font-medium text-ink">{label}</span>
      {sublabel && <span className="text-xs text-ink-muted">{sublabel}</span>}
    </Link>
  );
}
