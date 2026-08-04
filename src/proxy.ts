import { NextResponse, type NextRequest } from "next/server";
import { readSessionCookie, SESSION_COOKIE_NAME } from "@/lib/session";
import { Role } from "@/generated/prisma/enums";

// Default-deny: everything not explicitly listed here requires a valid
// session. This is deliberately an allowlist of what's public, not a
// denylist of what's protected, so a newly added page is private by
// default unless someone deliberately exposes it.
const PUBLIC_EXACT = new Set<string>([
  "/",
  "/login",
  "/redeem",
  "/forgot-password",
  "/offline",
  "/manifest.webmanifest",
  "/robots.txt",
  "/api/auth/login",
  "/api/invites/redeem",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/cron/rsvp-reminder",
]);

const PUBLIC_PREFIXES = [
  "/redeem/",
  "/reset-password/",
  "/share/",
  "/api/share/",
  "/icons/",
  "/images/",
];

function isPublicPath(pathname: string) {
  if (PUBLIC_EXACT.has(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

const ADMIN_PREFIXES = ["/admin", "/api/admin"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const cookieValue = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await readSessionCookie(cookieValue);

  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAdminRoute = ADMIN_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (
    isAdminRoute &&
    session.role !== Role.ADMIN &&
    session.role !== Role.SUPERADMIN
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // A guest whose invite granted PENDING_GUEST hasn't been approved yet —
  // keep them out of event content until an admin promotes their role.
  // Signing out must always work regardless of approval status.
  if (
    session.role === Role.PENDING_GUEST &&
    !isAdminRoute &&
    pathname !== "/pending" &&
    pathname !== "/api/auth/logout"
  ) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.redirect(new URL("/pending", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|sw\\.js).*)"],
};
