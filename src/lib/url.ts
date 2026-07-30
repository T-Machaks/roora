/**
 * Next.js's self-hosted server builds `request.url` from its own bind
 * config (effectively "http://localhost:<PORT>"), not from the Host
 * header a reverse proxy forwards — confirmed by deploying behind Caddy
 * and inspecting `request.url` directly: it came back as
 * "https://localhost:3000/..." even though `Host`/`X-Forwarded-Host`
 * both correctly said the real domain. Route Handlers that build
 * absolute URLs (redirects, QR codes, share links) must use this
 * instead of `new URL(path, request.url)`.
 *
 * (proxy.ts is unaffected: Next normalizes NextResponse.redirect() from
 * middleware/proxy to a relative Location header, which browsers resolve
 * against the real address bar origin regardless of this quirk.)
 */
export function getRequestBaseUrl(request: Request): string {
  const proto = request.headers.get("x-forwarded-proto");
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  if (proto && host) {
    return `${proto}://${host}`;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}
