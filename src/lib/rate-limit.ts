/**
 * In-memory fixed-window rate limiter. Deliberately simple: this app is
 * designed for a single self-hosted instance (see plan), so there's no
 * shared store (Redis etc.) across processes/replicas. If you ever scale
 * to multiple instances, swap this for a shared-store limiter.
 */

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Periodically drop expired buckets so this Map doesn't grow unbounded
// over a long-running process.
setInterval(
  () => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(key);
    }
  },
  10 * 60 * 1000
).unref?.();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const existing = buckets.get(key);
  if (!existing || existing.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

/**
 * Best-effort client IP from X-Forwarded-For, which any reverse proxy
 * (nginx, Caddy, Traefik) in front of this app should set. Without one,
 * all direct clients share a single bucket — deploy behind a reverse
 * proxy for per-client limiting.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}
