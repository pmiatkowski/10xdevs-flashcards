import { z } from "zod";
import { loginSchema as loginFormSchema, emailSchema, passwordSchema } from "./auth";

// Custom registration schema with stronger password validation
export const registerFormSchema = z
  .object({
    email: emailSchema,
    password: z
      .string({
        required_error: "Password is required",
      })
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .max(72, "Password must be 72 characters or less"),
    confirmPassword: z
      .string({
        required_error: "Please confirm your password",
      })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Custom reset password schema with token validation
export const resetPasswordFormSchema = z
  .object({
    token: z.string().min(1, "Reset token is invalid or expired"),
    newPassword: passwordSchema,
    confirmPassword: z
      .string({
        required_error: "Please confirm your password",
      })
      .min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Re-export the login schema
export { loginFormSchema };

// Flashcard validation schema
export const flashcardSchema = z.object({
  front_text: z
    .string()
    .min(1, "Front text is required")
    .transform((text) => text.trim()),
  back_text: z
    .string()
    .min(1, "Back text is required")
    .transform((text) => text.trim()),
});

// AI generation candidates schema
export const generateCandidatesSchema = z.object({
  sourceText: z
    .string()
    .min(1, "Please enter some text to generate flashcards from")
    .refine((text) => text.trim().length > 0, {
      message: "Please enter some text to generate flashcards from",
    })
    .transform((text) => text.trim()),
});

// Type exports
export type FlashcardData = z.infer<typeof flashcardSchema>;
export type GenerateCandidatesData = z.infer<typeof generateCandidatesSchema>;
