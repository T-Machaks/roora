import webpush from "web-push";
import { db } from "@/lib/db";

let configured = false;

function configure() {
  if (configured) return;
  const subject = process.env.VAPID_SUBJECT;
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!subject || !publicKey || !privateKey) {
    throw new Error(
      "VAPID_SUBJECT/VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY must be set to send push notifications."
    );
  }
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
}

/** Sends a push notification to every subscribed device. Subscriptions
 * the push service reports as gone (404/410 — uninstalled app, expired
 * subscription) are pruned as they're hit, so the table doesn't
 * accumulate dead endpoints. */
export async function sendPushToAll(payload: {
  title: string;
  body: string;
  url?: string;
}): Promise<{ sent: number; failed: number }> {
  if (process.env.ENABLE_PUSH !== "true") return { sent: 0, failed: 0 };
  configure();

  const subscriptions = await db.pushSubscription.findMany();
  const data = JSON.stringify(payload);

  let sent = 0;
  let failed = 0;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          data
        );
        sent++;
      } catch (err) {
        failed++;
        const statusCode = (err as { statusCode?: number }).statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await db.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
        }
      }
    })
  );

  return { sent, failed };
}
