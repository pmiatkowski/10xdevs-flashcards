/**
 * Error classes for OpenRouter service integration.
 * These errors represent various failure scenarios that can occur when
 * interacting with the OpenRouter API or processing its responses.
 */

/**
 * Thrown when required configuration (API key, model) is missing
 */
export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

/**
 * Thrown when network communication with OpenRouter API fails
 */
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NetworkError";
  }
}

/**
 * Thrown when API authentication fails (401/403)
 */
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthenticationError";
  }
}

/**
 * Thrown when API requires payment (402)
 */
export class PaymentRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentRequiredError";
  }
}

/**
 * Thrown when API rate limit is exceeded (429)
 */
export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Thrown for general API service errors (5xx)
 */
export class ApiServiceError extends Error {
  constructor(
    message: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = "ApiServiceError";
  }
}

/**
 * Thrown when API response cannot be parsed as JSON
 */
export class InvalidResponseFormatError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidResponseFormatError";
  }
}

/**
 * Thrown when API response fails schema validation
 */
export class ResponseValidationError extends Error {
  constructor(
    message: string,
    public validationErrors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ResponseValidationError";
  }
}

/**
 * Thrown when database operations fail
 */
export class DatabaseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DatabaseError";
  }
}

/**
 * Thrown when validation passes but results in no valid candidates
 */
export class EmptyValidResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmptyValidResponseError";
  }
}
