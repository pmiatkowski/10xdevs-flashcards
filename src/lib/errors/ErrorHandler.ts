import { toast } from "sonner";
import type { ApiErrorResponseDto } from "@/types";

/**
 * Formats and displays API error responses to the user
 * @param error The API error response object
 */
export function handleApiError(error: ApiErrorResponseDto): void {
  // If no message is provided, use a generic error message
  if (!error.message) {
    toast.error("Operation failed", {
      description: "An unexpected error occurred",
    });
    return;
  }

  // If error has a code, include it in the description
  if (error.code) {
    toast.error(error.message, {
      description: `Error code: ${error.code}`,
    });
    return;
  }

  // If error has details, format them for display
  if (error.details) {
    let description = "";

    if (Array.isArray(error.details.reasons) && error.details.reasons.length > 0) {
      description = error.details.reasons.join(", ");
    } else {
      description = "Additional error details available.";
    }

    toast.error(error.message, {
      description,
    });
    return;
  }

  // Default case: simple error message
  toast.error("Operation failed", {
    description: error.message,
  });
}

/**
 * Handles network errors and connection issues
 * @param error The error object from fetch or other network operations
 */
export function handleNetworkError(error: unknown): void {
  // Handle Error objects
  if (error instanceof Error) {
    toast.error("Connection error", {
      description: `${error.name ? `${error.name}: ` : ""}${error.message}`,
    });
    return;
  }

  // Handle unknown error types
  toast.error("Connection error", {
    description: "An unexpected network error occurred",
  });
}
