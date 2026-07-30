"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PUSH_ENABLED = process.env.NEXT_PUBLIC_ENABLE_PUSH === "true";

export function PushSubscribeButton() {
  const [status, setStatus] = useState<
    "idle" | "checking" | "subscribed" | "unsupported" | "denied"
  >("checking");

  useEffect(() => {
    if (!PUSH_ENABLED || !VAPID_PUBLIC_KEY) {
      setStatus("unsupported");
      return;
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setStatus("unsupported");
      return;
    }
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setStatus(sub ? "subscribed" : "idle"))
      .catch(() => setStatus("idle"));
  }, []);

  async function handleEnable() {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      setStatus("denied");
      return;
    }

    const reg = await navigator.serviceWorker.ready;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!),
    });

    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subscription.toJSON()),
    });

    setStatus("subscribed");
  }

  if (status === "unsupported" || status === "checking") return null;

  return (
    <div className="flex flex-col gap-2">
      {status === "subscribed" ? (
        <p className="text-sm text-primary">Notifications are enabled on this device.</p>
      ) : (
        <Button type="button" variant="outline" onClick={handleEnable}>
          Enable notifications
        </Button>
      )}
      {status === "denied" && (
        <p className="text-xs text-ink-muted">
          Notifications were blocked. You can allow them again in your browser settings.
        </p>
      )}
    </div>
  );
}
