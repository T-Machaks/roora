import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSession, type SessionData } from "@/lib/session";
import { db } from "@/lib/db";
import { Role, AdminArea } from "@/generated/prisma/enums";

const ROLE_RANK: Record<Role, number> = {
  PENDING_GUEST: 0,
  APPROVED_GUEST: 1,
  ADMIN: 2,
  SUPERADMIN: 3,
};

export function hasRole(role: Role, allowed: Role[]) {
  return allowed.includes(role);
}

export function isAtLeast(role: Role, minimum: Role) {
  return ROLE_RANK[role] >= ROLE_RANK[minimum];
}

/** Server Components / Server Actions: redirects to /login if unauthenticated. */
export async function requireSession(): Promise<SessionData> {
  const session = await getSession();
  if (!session.userId) {
    redirect("/login");
  }
  return session as SessionData;
}

/** Server Components / Server Actions: redirects if unauthenticated or wrong role. */
export async function requireRole(allowed: Role[]): Promise<SessionData> {
  const session = await requireSession();
  if (!hasRole(session.role, allowed)) {
    redirect("/dashboard");
  }
  return session;
}

/**
 * Route Handlers: never trust that proxy.ts already checked this request —
 * every mutation route calls this (or requireApiRole) independently.
 * Returns the session, or a ready-to-return 401 NextResponse.
 */
export async function requireApiSession(): Promise<SessionData | NextResponse> {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return session as SessionData;
}

export async function requireApiRole(
  allowed: Role[]
): Promise<SessionData | NextResponse> {
  const result = await requireApiSession();
  if (result instanceof NextResponse) return result;
  if (!hasRole(result.role, allowed)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

/**
 * SUPERADMIN implicitly has every admin area — this is only ever checked
 * for ADMIN, and always re-read from the database (never cached in the
 * session cookie) so a superadmin revoking access takes effect on the
 * ADMIN's very next request, not just their next login.
 */
export async function hasArea(session: SessionData, area: AdminArea): Promise<boolean> {
  if (session.role === Role.SUPERADMIN) return true;
  if (session.role !== Role.ADMIN) return false;
  const grant = await db.userPermission.findUnique({
    where: { userId_area: { userId: session.userId, area } },
  });
  return grant !== null;
}

/** Server Components / Server Actions: redirects if unauthenticated or lacking this admin area. */
export async function requireArea(area: AdminArea): Promise<SessionData> {
  const session = await requireRole([Role.ADMIN, Role.SUPERADMIN]);
  if (!(await hasArea(session, area))) {
    redirect("/admin");
  }
  return session;
}

/** Route Handlers: same as requireArea, but returns a 403 instead of redirecting. */
export async function requireApiArea(
  area: AdminArea
): Promise<SessionData | NextResponse> {
  const result = await requireApiRole([Role.ADMIN, Role.SUPERADMIN]);
  if (result instanceof NextResponse) return result;
  if (!(await hasArea(result, area))) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return result;
}

const ALL_ADMIN_AREAS = Object.values(AdminArea);

/** Every area this session can access — all of them for SUPERADMIN, granted-only for ADMIN. */
export async function grantedAreas(session: SessionData): Promise<AdminArea[]> {
  if (session.role === Role.SUPERADMIN) return ALL_ADMIN_AREAS;
  if (session.role !== Role.ADMIN) return [];
  const grants = await db.userPermission.findMany({
    where: { userId: session.userId },
    select: { area: true },
  });
  return grants.map((g) => g.area);
}
