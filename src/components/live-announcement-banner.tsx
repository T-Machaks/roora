"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const POLL_MS = 15_000;
const DISMISSED_KEY = "roora-dismissed-announcement";

type Announcement = { text: string; postedAt: string } | null;

export function LiveAnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/live-announcement");
        if (!res.ok) return;
        const data: { announcement: Announcement } = await res.json();
        if (cancelled) return;
        const dismissed = sessionStorage.getItem(DISMISSED_KEY);
        if (data.announcement && data.announcement.postedAt !== dismissed) {
          setAnnouncement(data.announcement);
        } else if (!data.announcement) {
          setAnnouncement(null);
        }
      } catch {
        // Transient network errors just wait for the next poll.
      }
    }

    const timer = setTimeout(poll, 0);
    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  function dismiss() {
    if (announcement) sessionStorage.setItem(DISMISSED_KEY, announcement.postedAt);
    setAnnouncement(null);
  }

  return (
    <AnimatePresence>
      {announcement && (
        <motion.div
          initial={reducedMotion ? undefined : { opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -16 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="sticky top-0 z-30 flex items-center justify-between gap-3 bg-primary px-4 py-2.5 text-secondary"
          role="status"
        >
          <p className="text-sm font-medium">{announcement.text}</p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Dismiss announcement"
            className="shrink-0 text-secondary/80 hover:text-secondary"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
