"use client";

import { useState } from "react";

export function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard API unavailable; nothing we can do silently
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-full border border-primary px-3 py-1 text-xs font-medium text-primary hover:bg-primary hover:text-secondary"
    >
      {copied ? "Copied!" : "Copy link"}
    </button>
  );
}
