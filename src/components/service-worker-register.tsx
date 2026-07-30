"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    let reloaded = false;

    // sw.js calls self.skipWaiting() + clients.claim(), so a new deploy
    // activates immediately rather than waiting for every open tab to
    // close — but an already-open tab is still running the OLD page's
    // JS until it reloads. This is what actually "forces" that: the
    // moment the new worker takes control, reload once so guests are
    // never silently stuck on a stale build.
    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    });

    navigator.serviceWorker.register("/sw.js").then((registration) => {
      // Browsers auto-check for a new sw.js on navigation, but that can
      // be as infrequent as once a day for a tab left open — actively
      // re-check whenever the guest returns to the tab so an update
      // deployed while they were away is picked up promptly.
      const recheck = () => {
        if (document.visibilityState === "visible") registration.update();
      };
      document.addEventListener("visibilitychange", recheck);
      window.addEventListener("focus", recheck);
    }).catch(() => {
      // Installability is a progressive enhancement — silently no-op if
      // registration fails (e.g. unsupported browser).
    });
  }, []);

  return null;
}
