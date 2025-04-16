interface ErrorLogData {
  message: string;
  error?: Error | unknown;
  userId?: string;
  context?: Record<string, unknown>;
}

/**
 * Logs server-side errors with consistent formatting and context
 */
export function logServerError({ message, error, userId, context }: ErrorLogData): void {
  const timestamp = new Date().toISOString();
  const errorDetails =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : error;

  console.error(
    JSON.stringify(
      {
        timestamp,
        message,
        errorDetails,
        userId,
        ...context,
      },
      null,
      2
    )
  );
}
