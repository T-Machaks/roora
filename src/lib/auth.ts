import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { getSession, type SessionData } from "@/lib/session";
import { Role } from "@/generated/prisma/enums";

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
