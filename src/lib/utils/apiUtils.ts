import { ApiError, NetworkError, ValidationError, AuthenticationError, ServerError } from "../errors/apiErrors";
import type { ApiErrorResponseDto } from "../../types";

interface RequestOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Makes an API request with standardized error handling
 * @param url The URL to make the request to
 * @param options Request options (method, body, headers)
 * @returns Response data
 * @throws {ApiError} When request fails
 */
export async function apiRequest<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, headers = {} } = options;

  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      let errorMessage: string;
      try {
        const errorData = (await response.json()) as ApiErrorResponseDto;
        errorMessage = errorData.message || "An unknown error occurred";
      } catch {
        errorMessage = "Failed to parse error response";
      }

      switch (response.status) {
        case 400:
          throw new ValidationError(errorMessage);
        case 401:
        case 403:
          throw new AuthenticationError(errorMessage);
        case 500:
        case 502:
        case 503:
        case 504:
          throw new ServerError(errorMessage);
        default:
          throw new ApiError(errorMessage, response.status);
      }
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return null as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new NetworkError(error instanceof Error ? error.message : "Failed to make request");
  }
}

/**
 * Formats an API error for display
 * @param error The error to format
 * @returns A user-friendly error message
 */
export function formatApiError(error: unknown): string {
  if (error instanceof ValidationError) {
    return error.message;
  }
  if (error instanceof AuthenticationError) {
    return "Please log in to perform this action";
  }
  if (error instanceof ServerError) {
    return "A server error occurred. Please try again later.";
  }
  if (error instanceof NetworkError) {
    return "Connection failed. Please check your internet connection.";
  }
  if (error instanceof ApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
}
