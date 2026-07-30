import { nanoid } from "nanoid";

export function generateShareToken() {
  return nanoid(32);
}

export function isShareLinkValid(link: {
  revoked: boolean;
  expiresAt: Date | null;
  maxViews: number | null;
  viewCount: number;
}) {
  if (link.revoked) return false;
  if (link.expiresAt && link.expiresAt < new Date()) return false;
  if (link.maxViews !== null && link.viewCount >= link.maxViews) return false;
  return true;
}
