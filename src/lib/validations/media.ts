import { z } from "zod";

export const moderateActionSchema = z.object({
  action: z.enum(["APPROVE", "REJECT", "HIDE", "UNHIDE"]),
  reason: z.string().trim().max(300).optional(),
});

export const commentSchema = z.object({
  body: z.string().trim().min(1, "Comment cannot be empty").max(1000),
});
