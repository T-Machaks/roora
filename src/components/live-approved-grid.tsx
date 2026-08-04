"use client";

import { useEffect, useRef, useState } from "react";
import { GalleryGridItem } from "@/components/gallery-grid-item";
import { MediaThumb } from "@/components/media-thumb";

const POLL_MS = 30_000;

type MediaItem = { id: string; type: "IMAGE" | "VIDEO"; createdAt: string };

export function LiveApprovedGrid({ initialItems }: { initialItems: MediaItem[] }) {
  const [items, setItems] = useState(initialItems);
  const latestRef = useRef(initialItems[0]?.createdAt ?? new Date().toISOString());

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch(
          `/api/media/approved-since?since=${encodeURIComponent(latestRef.current)}`
        );
        if (!res.ok) return;
        const data: { items: MediaItem[] } = await res.json();
        if (cancelled || data.items.length === 0) return;

        latestRef.current = data.items[0].createdAt;
        setItems((prev) => {
          const existing = new Set(prev.map((p) => p.id));
          const fresh = data.items.filter((i) => !existing.has(i.id));
          return [...fresh, ...prev];
        });
      } catch {
        // Transient network errors just wait for the next poll.
      }
    }

    const interval = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  if (items.length === 0) {
    return (
      <p className="text-sm text-ink-muted">
        No memories have been shared yet — be the first!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {items.map((item, i) => (
        <GalleryGridItem
          key={item.id}
          href={`/gallery/${item.id}`}
          index={i}
          className="aspect-square overflow-hidden rounded-lg border border-border block"
        >
          <MediaThumb id={item.id} type={item.type} />
        </GalleryGridItem>
      ))}
    </div>
  );
}
