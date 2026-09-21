import axios from 'axios';

export const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const message: string | undefined =
      error.response?.data?.message ??
      error.response?.data?.error;

    if (message) return message;

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
