"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type CommentItem = {
  id: string;
  body: string;
  author: { name: string };
  createdAt: string;
  canDelete: boolean;
};

export function CommentSection({
  mediaId,
  initialComments,
}: {
  mediaId: string;
  initialComments: CommentItem[];
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/media/${mediaId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setBody("");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-medium uppercase tracking-wide text-ink-muted">
        Comments
      </h2>
      <div className="flex flex-col gap-3">
        {initialComments.length === 0 && (
          <p className="text-sm text-ink-muted">Be the first to comment.</p>
        )}
        {initialComments.map((c) => (
          <div key={c.id} className="rounded-lg border border-border bg-surface p-3 text-sm">
            <div className="flex items-center justify-between">
              <p className="font-medium text-ink">{c.author.name}</p>
              {c.canDelete && (
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-xs text-red-700 underline"
                >
                  Delete
                </button>
              )}
            </div>
            <p className="mt-1 text-ink-muted">{c.body}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="Leave a comment…"
          className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm focus:border-primary focus:outline-none"
          required
        />
        {error && <p className="text-sm text-red-700">{error}</p>}
        <Button type="submit" variant="outline" disabled={loading} className="self-start">
          {loading ? "Posting…" : "Post comment"}
        </Button>
      </form>
    </div>
  );
}
