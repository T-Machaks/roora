"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ModerationActions({ mediaId }: { mediaId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "APPROVE" | "REJECT" | "HIDE") {
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/media/${mediaId}/moderate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => act("APPROVE")}
          disabled={loading !== null}
          className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-secondary hover:bg-primary-dark disabled:opacity-50"
        >
          {loading === "APPROVE" ? "Approving…" : "Approve"}
        </button>
        <button
          type="button"
          onClick={() => act("REJECT")}
          disabled={loading !== null}
          className="rounded-full border border-red-700 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-700 hover:text-white disabled:opacity-50"
        >
          {loading === "REJECT" ? "Rejecting…" : "Reject"}
        </button>
        <button
          type="button"
          onClick={() => act("HIDE")}
          disabled={loading !== null}
          className="rounded-full border border-border px-3 py-1 text-xs font-medium text-ink-muted hover:bg-border disabled:opacity-50"
        >
          {loading === "HIDE" ? "Hiding…" : "Hide"}
        </button>
      </div>
      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
