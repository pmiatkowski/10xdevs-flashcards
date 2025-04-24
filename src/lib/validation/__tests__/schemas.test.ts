import { describe, it, expect } from "vitest";
import {
  loginFormSchema,
  registerFormSchema,
  resetPasswordFormSchema,
  flashcardSchema,
  generateCandidatesSchema,
} from "../schemas";

describe("Validation Schemas", () => {
  describe("loginFormSchema", () => {
    it("validates valid login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("invalidates empty email", () => {
      const invalidData = {
        email: "",
        password: "password123",
      };

      const result = loginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Email is required");
      }
    });

    it("invalidates invalid email format", () => {
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      };

      const result = loginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Please enter a valid email address");
      }
    });

    it("invalidates empty password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "",
      };

      const result = loginFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Password is required");
      }
    });
  });

  describe("registerFormSchema", () => {
    it("validates valid registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
      };

      const result = registerFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("invalidates mismatched passwords", () => {
      const invalidData = {
        email: "test@example.com",
        password: "Password123!",
        confirmPassword: "Password456!",
      };

      const result = registerFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Passwords don't match");
      }
    });

    it("invalidates weak password", () => {
      const invalidData = {
        email: "test@example.com",
        password: "weak",
        confirmPassword: "weak",
      };

      const result = registerFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toContain("Password must");
      }
    });
  });

  describe("resetPasswordFormSchema", () => {
    it("validates valid reset password data", () => {
      const validData = {
        token: "valid-token",
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      };

      const result = resetPasswordFormSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("invalidates missing token", () => {
      const invalidData = {
        token: "",
        newPassword: "NewPassword123!",
        confirmPassword: "NewPassword123!",
      };

      const result = resetPasswordFormSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Reset token is invalid or expired");
      }
    });
  });

  describe("flashcardSchema", () => {
    it("validates valid flashcard data", () => {
      const validData = {
        front_text: "What is TypeScript?",
        back_text: "A typed superset of JavaScript",
      };

      const result = flashcardSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("invalidates empty front text", () => {
      const invalidData = {
        front_text: "",
        back_text: "A typed superset of JavaScript",
      };

      const result = flashcardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Front text is required");
      }
    });

    it("invalidates empty back text", () => {
      const invalidData = {
        front_text: "What is TypeScript?",
        back_text: "",
      };

      const result = flashcardSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Back text is required");
      }
    });

    it("trims whitespace from texts", () => {
      const data = {
        front_text: "  What is TypeScript?  ",
        back_text: "  A typed superset of JavaScript  ",
      };

      const result = flashcardSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.front_text).toBe("What is TypeScript?");
        expect(result.data.back_text).toBe("A typed superset of JavaScript");
      }
    });
  });

  describe("generateCandidatesSchema", () => {
    it("validates valid source text", () => {
      const validData = {
        sourceText: "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
      };

      const result = generateCandidatesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("invalidates empty source text", () => {
      const invalidData = {
        sourceText: "",
      };

      const result = generateCandidatesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Please enter some text to generate flashcards from");
      }
    });

    it("invalidates whitespace-only source text", () => {
      const invalidData = {
        sourceText: "   ",
      };

      const result = generateCandidatesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Please enter some text to generate flashcards from");
      }
    });

    it("trims whitespace from source text", () => {
      const data = {
        sourceText: "  TypeScript is awesome!  ",
      };

      const result = generateCandidatesSchema.safeParse(data);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.sourceText).toBe("TypeScript is awesome!");
      }
    });
  });
});
