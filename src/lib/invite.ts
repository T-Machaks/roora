import { customAlphabet, nanoid } from "nanoid";

// Excludes visually ambiguous characters (0/O, 1/I) since guests type this by hand.
const codeAlphabet = customAlphabet("23456789ABCDEFGHJKMNPQRSTUVWXYZ", 8);

export function generateInviteCode() {
  return codeAlphabet();
}

export function generateInviteToken() {
  return nanoid(32);
}
