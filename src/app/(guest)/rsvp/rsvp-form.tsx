"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

type Status = "ATTENDING" | "NOT_ATTENDING" | "MAYBE";

const OPTIONS: { value: Status; label: string }[] = [
  { value: "ATTENDING", label: "Joyfully attending" },
  { value: "MAYBE", label: "Not sure yet" },
  { value: "NOT_ATTENDING", label: "Can't make it" },
];

export function RsvpForm({
  initialStatus,
  initialGuestCount,
  initialNotes,
}: {
  initialStatus: Status;
  initialGuestCount: number;
  initialNotes: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [guestCount, setGuestCount] = useState(initialGuestCount);
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    setLoading(true);
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, guestCount, notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong.");
        return;
      }
      setSaved(true);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-sm ${
              status === opt.value
                ? "border-primary bg-secondary/40"
                : "border-border bg-surface"
            }`}
          >
            <input
              type="radio"
              name="status"
              value={opt.value}
              checked={status === opt.value}
              onChange={() => setStatus(opt.value)}
              className="accent-[var(--primary)]"
            />
            {opt.label}
          </label>
        ))}
      </div>

      {status === "ATTENDING" && (
        <div>
          <Label htmlFor="guestCount">Number of guests (including you)</Label>
          <Input
            id="guestCount"
            type="number"
            min={1}
            max={20}
            value={guestCount}
            onChange={(e) => setGuestCount(Number(e.target.value))}
          />
        </div>
      )}

      <div>
        <Label htmlFor="notes">Notes for the hosts (optional)</Label>
        <textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={500}
          className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {saved && !error && (
        <p className="text-sm text-primary">Your RSVP has been saved.</p>
      )}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Saving…" : "Save RSVP"}
      </Button>
    </form>
  );
}
