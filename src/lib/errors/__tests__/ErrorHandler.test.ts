import { describe, it, expect, vi } from "vitest";
import { handleApiError, handleNetworkError } from "../ErrorHandler";
import { toast } from "sonner";
import type { ApiErrorResponseDto } from "@/types";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("Error Handlers", () => {
  describe("handleApiError", () => {
    it("handles simple error message", () => {
      const error: ApiErrorResponseDto = {
        message: "Something went wrong",
      };

      handleApiError(error);

      expect(toast.error).toHaveBeenCalledWith("Operation failed", {
        description: "Something went wrong",
      });
    });

    it("handles error with code", () => {
      const error: ApiErrorResponseDto = {
        message: "Invalid input",
        code: "VALIDATION_ERROR",
      };

      handleApiError(error);

      expect(toast.error).toHaveBeenCalledWith("Invalid input", {
        description: expect.stringContaining("VALIDATION_ERROR"),
      });
    });

    it("handles error with details", () => {
      const error: ApiErrorResponseDto = {
        message: "Multiple errors occurred",
        details: {
          fields: ["email", "password"],
          reasons: ["Invalid email", "Password too short"],
        },
      };

      handleApiError(error);

      expect(toast.error).toHaveBeenCalledWith("Multiple errors occurred", {
        description: expect.stringContaining("Invalid email"),
      });
    });

    it("handles missing message", () => {
      const error = {} as ApiErrorResponseDto;

      handleApiError(error);

      expect(toast.error).toHaveBeenCalledWith("Operation failed", {
        description: "An unexpected error occurred",
      });
    });
  });

  describe("handleNetworkError", () => {
    it("handles connection error", () => {
      const error = new Error("Failed to fetch");

      handleNetworkError(error);

      expect(toast.error).toHaveBeenCalledWith("Connection error", {
        description: expect.stringContaining("Failed to fetch"),
      });
    });

    it("handles timeout error", () => {
      const error = new Error("Request timed out");

      handleNetworkError(error);

      expect(toast.error).toHaveBeenCalledWith("Connection error", {
        description: expect.stringContaining("Request timed out"),
      });
    });

    it("handles unknown error type", () => {
      const error = {};

      handleNetworkError(error);

      expect(toast.error).toHaveBeenCalledWith("Connection error", {
        description: "An unexpected network error occurred",
      });
    });

    it("handles error with custom name", () => {
      const error = new Error("Custom error");
      error.name = "CustomError";

      handleNetworkError(error);

      expect(toast.error).toHaveBeenCalledWith("Connection error", {
        description: expect.stringContaining("CustomError"),
      });
    });
  });
});
