import type { ApiErrorResponseDto } from "@/types";
import type { PostgrestError } from "@supabase/supabase-js";

/**
 * Base API error class with common functionality
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Thrown when API request fails due to network issues
 */
export class NetworkError extends ApiError {
  constructor(message = "Network connection failed") {
    super(message, 0);
    this.name = "NetworkError";
  }
}

/**
 * Thrown when response validation fails
 */
export class ValidationError extends ApiError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

/**
 * Thrown when user is not authenticated
 */
export class AuthenticationError extends ApiError {
  constructor(message = "Authentication required") {
    super(message, 401);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when server encounters an error
 */
export class ServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(message, 500);
    this.name = "ServerError";
  }
}

export function formatError(error: unknown): Response {
  console.error("API Error:", error);

  // Obsługa błędów Supabase
  if (isPostgrestError(error)) {
    return new Response(
      JSON.stringify({
        message: error.message,
        code: error.code,
        details: error.details,
      } satisfies ApiErrorResponseDto),
      { status: error.code === "PGRST116" ? 404 : 500 }
    );
  }

  // Obsługa błędów walidacji Zod
  if (error instanceof Error) {
    return new Response(
      JSON.stringify({
        message: error.message,
        code: "VALIDATION_ERROR",
      } satisfies ApiErrorResponseDto),
      { status: 400 }
    );
  }

  // Ogólny błąd
  return new Response(
    JSON.stringify({
      message: "An unexpected error occurred",
      code: "INTERNAL_SERVER_ERROR",
    } satisfies ApiErrorResponseDto),
    { status: 500 }
  );
}

function isPostgrestError(error: unknown): error is PostgrestError {
  return typeof error === "object" && error !== null && "message" in error && "code" in error && "details" in error;
}
