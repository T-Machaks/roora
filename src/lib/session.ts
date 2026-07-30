import { cookies } from "next/headers";
import { getIronSession, unsealData, type SessionOptions } from "iron-session";
import type { Role } from "@/generated/prisma/enums";

export type SessionData = {
  userId: string;
  role: Role;
  name: string;
};

export const SESSION_COOKIE_NAME = "roora_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSessionPassword() {
  const password = process.env.SESSION_SECRET;
  if (!password || password.length < 32) {
    throw new Error(
      "SESSION_SECRET must be set to a string of at least 32 characters."
    );
  }
  return password;
}

/**
 * Built lazily (not as a module-level constant) so that merely importing
 * this file — which proxy.ts always does — can't throw during `next
 * build` in environments where env vars are only available at runtime
 * (e.g. the Docker builder stage, which deliberately excludes .env from
 * the build context). The check still runs before any session is
 * actually read or written.
 */
function getSessionOptions(): SessionOptions {
  return {
    password: getSessionPassword(),
    cookieName: SESSION_COOKIE_NAME,
    ttl: SESSION_TTL_SECONDS,
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  };
}

/** For use in Server Components, Route Handlers, and Server Actions. */
export async function getSession() {
  return getIronSession<SessionData>(await cookies(), getSessionOptions());
}

/**
 * Lightweight, read-only decode of the session cookie value, for use in
 * proxy.ts where there is no persistent request/response cookie jar to
 * hand iron-session — we only need to verify+read, never write.
 */
export async function readSessionCookie(
  cookieValue: string | undefined
): Promise<SessionData | null> {
  if (!cookieValue) return null;
  try {
    const options = getSessionOptions();
    const data = await unsealData<Partial<SessionData>>(cookieValue, {
      password: options.password,
      ttl: options.ttl,
    });
    if (!data.userId || !data.role || !data.name) return null;
    return data as SessionData;
  } catch {
    return null;
  }
}
