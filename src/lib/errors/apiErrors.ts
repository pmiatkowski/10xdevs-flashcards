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
