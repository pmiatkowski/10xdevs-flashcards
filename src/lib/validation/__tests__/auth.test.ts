import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  emailSchema,
  passwordSchema,
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../auth";

describe("Auth Validation Schemas", () => {
  describe("emailSchema", () => {
    it("validates correct email formats", () => {
      const validEmails = ["test@example.com", "user.name@domain.com", "user+tag@example.co.uk"];

      validEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).not.toThrow();
      });
    });

    it("rejects invalid email formats", () => {
      const invalidEmails = ["", "invalid", "@domain.com", "user@", "user@domain", "user.domain.com"];

      invalidEmails.forEach((email) => {
        expect(() => emailSchema.parse(email)).toThrow();
      });
    });

    it("provides correct error message for invalid email", () => {
      try {
        emailSchema.parse("invalid");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe("Please enter a valid email address");
        }
      }
    });
  });

  describe("passwordSchema", () => {
    it("accepts valid passwords", () => {
      const validPasswords = ["password123", "securePass", "1234abcd"];

      validPasswords.forEach((password) => {
        expect(() => passwordSchema.parse(password)).not.toThrow();
      });
    });

    it("rejects passwords shorter than 4 characters", () => {
      const invalidPasswords = ["", "a", "12", "abc"];

      invalidPasswords.forEach((password) => {
        expect(() => passwordSchema.parse(password)).toThrow();
      });
    });

    it("provides correct error message for short password", () => {
      try {
        passwordSchema.parse("123");
      } catch (error) {
        if (error instanceof z.ZodError) {
          expect(error.errors[0].message).toBe("Password must be at least 4 characters");
        }
      }
    });
  });

  describe("loginSchema", () => {
    it("validates correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      expect(() => loginSchema.parse(validData)).not.toThrow();
    });

    it("rejects invalid login data", () => {
      const invalidData = [
        { email: "invalid", password: "password123" },
        { email: "test@example.com", password: "123" },
        { email: "", password: "" },
      ];

      invalidData.forEach((data) => {
        expect(() => loginSchema.parse(data)).toThrow();
      });
    });

    it("validates correct login data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = loginSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("requires email field", () => {
      const invalidData = {
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email is required");
      }
    });

    it("requires password field", () => {
      const invalidData = {
        email: "test@example.com",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is required");
      }
    });

    it("validates email format", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please enter a valid email address");
      }
    });

    it("validates password minimum length", () => {
      const invalidData = {
        email: "test@example.com",
        password: "123",
      };

      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password must be at least 4 characters");
      }
    });
  });

  describe("registerSchema", () => {
    it("validates correct registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      expect(() => registerSchema.parse(validData)).not.toThrow();
    });

    it("rejects mismatched passwords", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password456",
      };

      expect(() => registerSchema.parse(invalidData)).toThrow("Passwords don't match");
    });

    it("validates all fields independently", () => {
      const invalidData = {
        email: "invalid",
        password: "123",
        confirmPassword: "",
      };

      try {
        registerSchema.parse(invalidData);
      } catch (error) {
        if (error instanceof z.ZodError) {
          // Check that we have all expected error paths
          const errorPaths = error.errors.map((e: z.ZodIssue) => e.path[0]);
          expect(new Set(errorPaths)).toEqual(new Set(["email", "password", "confirmPassword"]));
        }
      }
    });

    it("validates correct registration data", () => {
      const validData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registerSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("requires email field", () => {
      const invalidData = {
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email is required");
      }
    });

    it("requires password field", () => {
      const invalidData = {
        email: "test@example.com",
        confirmPassword: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password is required");
      }
    });

    it("requires confirmPassword field", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please confirm your password");
      }
    });

    it("validates email format", () => {
      const invalidData = {
        email: "invalid-email",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Please enter a valid email address");
      }
    });

    it("validates password minimum length", () => {
      const invalidData = {
        email: "test@example.com",
        password: "123",
        confirmPassword: "123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password must be at least 4 characters");
      }
    });

    it("validates passwords match", () => {
      const invalidData = {
        email: "test@example.com",
        password: "password123",
        confirmPassword: "password456",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Passwords don't match");
      }
    });

    it("validates maximum email length", () => {
      const invalidData = {
        email: "a".repeat(256) + "@example.com",
        password: "password123",
        confirmPassword: "password123",
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Email must be 255 characters or less");
      }
    });

    it("validates maximum password length", () => {
      const invalidData = {
        email: "test@example.com",
        password: "a".repeat(73),
        confirmPassword: "a".repeat(73),
      };

      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Password must be 72 characters or less");
      }
    });
  });

  describe("forgotPasswordSchema", () => {
    it("validates correct email", () => {
      const validData = {
        email: "test@example.com",
      };

      expect(() => forgotPasswordSchema.parse(validData)).not.toThrow();
    });

    it("rejects invalid email", () => {
      const invalidData = {
        email: "invalid",
      };

      expect(() => forgotPasswordSchema.parse(invalidData)).toThrow();
    });
  });

  describe("resetPasswordSchema", () => {
    it("validates correct reset password data", () => {
      const validData = {
        newPassword: "password123",
        confirmPassword: "password123",
      };

      expect(() => resetPasswordSchema.parse(validData)).not.toThrow();
    });

    it("rejects mismatched passwords", () => {
      const invalidData = {
        newPassword: "password123",
        confirmPassword: "password456",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow("Passwords don't match");
    });

    it("validates password length requirements", () => {
      const invalidData = {
        newPassword: "123",
        confirmPassword: "123",
      };

      expect(() => resetPasswordSchema.parse(invalidData)).toThrow();
    });
  });
});
