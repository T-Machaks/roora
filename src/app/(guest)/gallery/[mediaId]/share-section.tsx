"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";

export function ShareSection({ mediaId }: { mediaId: string }) {
  const [link, setLink] = useState<{ url: string; qrUrl: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleShare() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/media/${mediaId}/share`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setLink({ url: data.url, qrUrl: data.qrUrl });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
        Share
      </h2>
      {!link ? (
        <Button type="button" variant="outline" onClick={handleShare} disabled={loading}>
          {loading ? "Generating link…" : "Get share link & QR code"}
        </Button>
      ) : (
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={link.qrUrl} alt="QR code for this shared memory" width={96} height={96} className="rounded-md border border-border" />
          <div className="flex flex-col gap-2">
            <CopyButton value={link.url} />
            <a href={link.qrUrl} download className="text-xs font-medium text-primary underline">
              Download QR
            </a>
          </div>
        </div>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}
      <p className="text-xs text-ink-muted">
        Anyone with this link can view and download this memory, even without an account.
      </p>
    </div>
  );
}
