"use client";

import { useState, type ReactNode } from "react";
import { WaxSeal } from "@/components/wax-seal";

export function InviteEnvelope({
  title = "You're Invited",
  subtitle,
  children,
}: {
  title?: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const [opened, setOpened] = useState(false);

  if (opened) {
    return (
      <div
        className="w-full max-w-sm"
        style={{ animation: "envelope-reveal 0.4s ease" }}
      >
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setOpened(true)}
      className="group flex w-full max-w-xs flex-col items-center gap-4"
    >
      <div className="relative w-full">
        <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-lg transition-transform duration-150 group-active:scale-[0.98]">
          <div
            className="h-20"
            style={{
              clipPath: "polygon(0 0, 100% 0, 50% 100%)",
              background: "linear-gradient(160deg, var(--secondary), var(--surface))",
            }}
          />
          <div className="flex flex-col items-center gap-1 px-6 pb-10 pt-9 text-center">
            <p className="font-display text-xl text-primary">{title}</p>
            {subtitle && <p className="text-xs text-ink-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="absolute left-1/2 top-20 -translate-x-1/2 -translate-y-1/2">
          <WaxSeal />
        </div>
      </div>
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-ink-muted">
        Tap to open
      </span>
    </button>
  );
}
