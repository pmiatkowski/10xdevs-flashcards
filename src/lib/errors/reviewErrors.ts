import { ApiError } from "./apiErrors";

/**
 * Thrown when SR algorithm encounters an error
 */
export class SRAlgorithmError extends ApiError {
  constructor(message = "Failed to calculate next review") {
    super(message, 500);
    this.name = "SRAlgorithmError";
  }
}

/**
 * Thrown when local storage operations fail
 */
export class StorageError extends Error {
  constructor(message = "Failed to access local storage") {
    super(message);
    this.name = "StorageError";
  }
}

/**
 * Thrown when no cards are available for review
 */
export class NoCardsAvailableError extends Error {
  constructor(message = "No cards available for review") {
    super(message);
    this.name = "NoCardsAvailableError";
  }
}
