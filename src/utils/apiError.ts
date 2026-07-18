/**
 * apiError.ts
 *
 * Extracts a human-readable error message from any error value.
 * Used in every hook's onError callback to feed the toast notification.
 *
 * Backend error envelope:
 *   { success: false, statusCode: number, message: string, error?: string }
 */

import axios from 'axios';

export const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    // Prefer the backend's structured message field.
    const message: string | undefined =
      error.response?.data?.message ??
      error.response?.data?.error;

    if (message) return message;

    // Fall back to the axios-level message (e.g. "Network Error", timeout).
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
