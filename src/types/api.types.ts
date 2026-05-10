/**
 * api.types.ts
 *
 * Generic API response envelope types matching the backend's standard response shape:
 * { success, statusCode, message, data, error }
 */

/** Standard successful API response wrapper */
export interface ApiResponse<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
}

/** Standard error response wrapper */
export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error?: string;
}

/** Paginated list response */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
