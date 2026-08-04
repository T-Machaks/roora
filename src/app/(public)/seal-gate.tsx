"use client";

import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

const STORAGE_KEY = "roora-seal-opened";
const SLICE_COUNT = 8;

const SLICES = Array.from({ length: SLICE_COUNT }, (_, i) => {
  const start = (360 / SLICE_COUNT) * i;
  const end = start + 360 / SLICE_COUNT;
  const mid = ((start + end) / 2) * (Math.PI / 180);
  return {
    clipPath: `polygon(50% 50%, ${point(start)}, ${point(end)})`,
    dx: Math.cos(mid) * 140,
    dy: Math.sin(mid) * 140,
    rotate: (i % 2 === 0 ? 1 : -1) * (40 + i * 6),
    delay: (i % 4) * 0.02,
  };
});

function point(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return `${(50 + 50 * Math.cos(rad)).toFixed(2)}% ${(50 + 50 * Math.sin(rad)).toFixed(2)}%`;
}

type Phase = "loading" | "sealed" | "cracking" | "open";

/** Two-phase landing gate: a tappable wax-seal screen that cracks open
 * (once per browser session — sessionStorage remembers it) into the real
 * landing content passed as children. */
export function SealGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    // Deferred a tick so this doesn't setState synchronously during the
    // effect's own commit (see install-prompt.tsx for the same pattern).
    const timer = setTimeout(() => {
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const alreadyOpened = sessionStorage.getItem(STORAGE_KEY);
      setPhase(reducedMotion || alreadyOpened ? "open" : "sealed");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  function handleTap() {
    if (phase !== "sealed") return;
    navigator.vibrate?.(50);
    setPhase("cracking");
    window.setTimeout(() => {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setPhase("open");
    }, 600);
  }

  if (phase === "loading") return null;

  return (
    <>
      <AnimatePresence>
        {phase !== "open" && (
          <motion.div
            key="seal-screen"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
            style={{
              background: "radial-gradient(circle at 50% 35%, #8b9a7c, #57694f 80%)",
            }}
          >
            <FloralBackdrop />

            <button
              type="button"
              onClick={handleTap}
              aria-label="Tap the seal to open your invitation"
              className="relative focus:outline-none"
              style={{ width: 180, height: 180 }}
            >
              {SLICES.map((slice, i) => (
                <motion.span
                  key={i}
                  className="absolute inset-0 rounded-full"
                  style={{
                    background: "radial-gradient(circle at 35% 30%, var(--primary-dark), var(--primary) 65%)",
                    clipPath: slice.clipPath,
                  }}
                  animate={
                    phase === "cracking"
                      ? { x: slice.dx, y: slice.dy, rotate: slice.rotate, opacity: 0 }
                      : { x: 0, y: 0, rotate: 0, opacity: 1 }
                  }
                  transition={{ type: "spring", stiffness: 140, damping: 14, delay: slice.delay }}
                />
              ))}
              <span
                className="font-display absolute inset-0 z-10 flex items-center justify-center text-4xl leading-none text-secondary transition-opacity duration-300"
                style={{ opacity: phase === "cracking" ? 0 : 1 }}
              >
                B&amp;T
              </span>
            </button>

            <p
              className="font-display mt-8 text-xs uppercase tracking-[0.35em] text-secondary/80 transition-opacity duration-300"
              style={{ opacity: phase === "cracking" ? 0 : 1 }}
            >
              Tap the seal to open
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={phase === "open" ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: phase === "cracking" ? 0.3 : 0 }}
      >
        {children}
      </motion.div>
    </>
  );
}

function FloralBackdrop() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-30"
      viewBox="0 0 400 800"
      fill="none"
      stroke="#C9A84C"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M30 50 Q65 15 100 50 T170 50" />
      <circle cx="30" cy="50" r="5" />
      <circle cx="100" cy="50" r="4" />
      <circle cx="170" cy="50" r="5" />
      <path d="M370 750 Q335 785 300 750 T230 750" />
      <circle cx="370" cy="750" r="5" />
      <circle cx="300" cy="750" r="4" />
      <circle cx="230" cy="750" r="5" />
      <path d="M15 420 Q50 400 40 365" />
      <path d="M385 420 Q350 440 360 475" />
    </svg>
  );
}
