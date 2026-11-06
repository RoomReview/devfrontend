import axios from 'axios';

interface ApiErrorPayload {
  message?: unknown;
  error?: unknown;
  data?: unknown;
}

interface ApiValidationIssue {
  path?: unknown;
  message?: unknown;
}

const formatValidationIssues = (data: unknown): string | null => {
  if (!Array.isArray(data)) return null;

  const messages = data.flatMap((item: ApiValidationIssue) => {
    if (typeof item?.message !== 'string' || !item.message.trim()) return [];
    const path = Array.isArray(item.path)
      ? item.path.filter((part): part is string | number => typeof part === 'string' || typeof part === 'number')
      : [];
    const field = path.length > 0
      ? String(path[path.length - 1])
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, (character) => character.toUpperCase())
      : '';
    return [field ? `${field}: ${item.message}` : item.message];
  });

  return messages.length > 0 ? messages.join(' ') : null;
};

export const extractApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiErrorPayload | undefined;
    const validationMessage = formatValidationIssues(payload?.data);
    if (validationMessage) return validationMessage;

    if (typeof payload?.message === 'string') {
      if (payload.message === 'Invalid request data') {
        return 'Please check the information you entered and try again.';
      }
      return payload.message;
    }

    if (typeof payload?.error === 'string') return payload.error;

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred. Please try again.';
};
