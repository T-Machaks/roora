"use client";

import { useEffect, useState } from "react";

const DISMISSED_KEY = "roora-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari's non-standard flag for "launched from home screen"
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [showIOSHint, setShowIOSHint] = useState(false);

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISSED_KEY)) return;

    if (isIOS()) {
      // iOS Safari has no beforeinstallprompt — "Add to Home Screen" is
      // only reachable via the Share sheet, so we can only point at it.
      // Deferred a tick so this doesn't setState synchronously during
      // the effect's own commit.
      const timer = setTimeout(() => {
        setShowIOSHint(true);
        setVisible(true);
      }, 0);
      return () => clearTimeout(timer);
    }

    function handleBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () =>
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  }, []);

  function dismiss() {
    localStorage.setItem(DISMISSED_KEY, "1");
    setVisible(false);
  }

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      localStorage.setItem(DISMISSED_KEY, "1");
    }
    setDeferredPrompt(null);
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-30 flex justify-center px-4">
      <div className="flex max-w-sm items-center gap-3 rounded-full border border-border bg-surface px-4 py-2 shadow-lg">
        <span className="text-sm text-ink">
          {showIOSHint
            ? "Install this app: tap Share, then “Add to Home Screen”"
            : "Add Maroora to your home screen"}
        </span>
        {!showIOSHint && (
          <button
            type="button"
            onClick={handleInstall}
            className="shrink-0 rounded-full bg-primary px-3 py-1 text-xs font-medium text-secondary hover:bg-primary-dark"
          >
            Install
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="shrink-0 text-ink-muted hover:text-ink"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
