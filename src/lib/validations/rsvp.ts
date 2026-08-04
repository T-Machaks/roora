import { z } from "zod";

export const DIETARY_OPTIONS = [
  "Vegetarian",
  "Vegan",
  "Halal",
  "Gluten-free",
  "Nut allergy",
] as const;

export const rsvpSchema = z.object({
  status: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]),
  guestCount: z.number().int().min(1).max(20),
  notes: z.string().max(500).optional(),
  songRequest: z.string().max(200).optional(),
  dietaryOptions: z.array(z.enum(DIETARY_OPTIONS)).default([]),
  dietaryOther: z.string().max(200).optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

export type DietaryNeeds = {
  options: (typeof DIETARY_OPTIONS)[number][];
  other: string | null;
};

export function encodeDietaryNeeds(
  options: (typeof DIETARY_OPTIONS)[number][],
  other: string | undefined
): string | null {
  if (options.length === 0 && !other) return null;
  const data: DietaryNeeds = { options, other: other || null };
  return JSON.stringify(data);
}

export function decodeDietaryNeeds(raw: string | null): DietaryNeeds {
  if (!raw) return { options: [], other: null };
  try {
    const parsed = JSON.parse(raw);
    return {
      options: Array.isArray(parsed.options) ? parsed.options : [],
      other: typeof parsed.other === "string" ? parsed.other : null,
    };
  } catch {
    return { options: [], other: null };
  }
}
