"use client";

import { useEffect, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

function getRemaining(targetMs: number) {
  const diff = targetMs - Date.now();
  if (diff <= 0) return null;
  const totalSeconds = Math.floor(diff / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

/** Live days/hours/min/sec countdown to `eventDate`. Switches to an
 * in-progress message during the event's calendar day, then a past-tense
 * message after — `eventDate` is stored as that day's midnight, so "the
 * event day" is [eventDate, eventDate + 24h). */
export function Countdown({ eventDate }: { eventDate: Date }) {
  const target = new Date(eventDate).getTime();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // Deferred a tick so this doesn't setState synchronously during the
    // effect's own commit (see install-prompt.tsx for the same pattern).
    const timer = setTimeout(() => setNow(Date.now()), 0);
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  // Avoids a server/client markup mismatch: render nothing on the server
  // and the initial client pass, then fill in once we have a real clock.
  if (now === null) return null;

  if (now >= target + DAY_MS) {
    return (
      <p className="font-display text-lg text-primary">
        What a beautiful day it was ❤️
      </p>
    );
  }

  if (now >= target) {
    return (
      <p className="font-display text-lg text-primary">
        It&rsquo;s happening now! 🎉
      </p>
    );
  }

  const remaining = getRemaining(target);
  if (!remaining) return null;

  const units = [
    { label: "Days", value: remaining.days },
    { label: "Hours", value: remaining.hours },
    { label: "Min", value: remaining.minutes },
    { label: "Sec", value: remaining.seconds },
  ];

  return (
    <div className="flex justify-center gap-2" role="timer" aria-live="off">
      {units.map((u) => (
        <div
          key={u.label}
          className="flex w-16 flex-col items-center rounded-xl border border-border bg-surface py-2"
        >
          <span className="font-display text-2xl font-semibold tabular-nums text-primary">
            {String(u.value).padStart(2, "0")}
          </span>
          <span className="text-[10px] uppercase tracking-wide text-ink-muted">
            {u.label}
          </span>
        </div>
      ))}
    </div>
  );
}
