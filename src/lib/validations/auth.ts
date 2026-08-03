import { z } from "zod";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Enter your email or guest ID"),
  password: z.string().min(1, "Enter your password"),
});

export const redeemSchema = z
  .object({
    identifier: z
      .string()
      .min(4, "Enter your invite code or use your invite link"),
    name: z.string().min(2, "Enter your full name").max(100),
    email: z.union([z.email("Enter a valid email"), z.literal("")]).optional(),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: z.email("Enter a valid email"),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RedeemInput = z.infer<typeof redeemSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
