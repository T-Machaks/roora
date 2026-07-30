import { z } from "zod";

export const rsvpSchema = z.object({
  status: z.enum(["ATTENDING", "NOT_ATTENDING", "MAYBE"]),
  guestCount: z.number().int().min(1).max(20),
  notes: z.string().max(500).optional(),
});

export type RsvpInput = z.infer<typeof rsvpSchema>;
