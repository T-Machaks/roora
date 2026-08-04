"use client";

import { motion, useReducedMotion } from "framer-motion";
import { formatTimeRange } from "@/lib/format";

type Item = {
  id: string;
  title: string;
  description: string | null;
  startTime: Date;
  endTime: Date | null;
};

export function ScheduleTimeline({ items }: { items: Item[] }) {
  const reducedMotion = useReducedMotion();

  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-ink-muted">
        The schedule will be shared closer to the date.
      </p>
    );
  }

  return (
    <ol className="relative flex flex-col gap-6 border-l border-border pl-5">
      {items.map((item, i) => (
        <motion.li
          key={item.id}
          className="relative"
          initial={reducedMotion ? undefined : { opacity: 0, y: 16 }}
          whileInView={reducedMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, ease: "easeOut", delay: (i % 6) * 0.06 }}
        >
          <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-primary bg-surface" />
          <p className="text-xs font-medium uppercase tracking-wide text-primary">
            {formatTimeRange(item.startTime, item.endTime)}
          </p>
          <p className="mt-1 font-medium text-ink">{item.title}</p>
          {item.description && (
            <p className="mt-1 text-sm text-ink-muted">{item.description}</p>
          )}
        </motion.li>
      ))}
    </ol>
  );
}
