/**
 * apiClient.ts
 *
 * The single Axios instance used by every service in the app.
 * Responsibilities:
 *   1. Attach the Authorization header to every outbound request.
 *   2. Silently refresh the access token on 401 responses, then retry the
 *      original request — transparent to all callers (hooks, services).
 *   3. Queue concurrent requests that arrive while a refresh is in-flight
 *      so only one refresh call ever goes out.
 *   4. Redirect to /login and clear tokens when a refresh itself fails.
 *
 * Every domain (auth, properties, reviews, users) flows through this client.
 * Neither hooks nor pages import axios directly.
 */

import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, API_VERSION } from '@/config/api.config';

// ── Token storage keys ────────────────────────────────────────────────────────
export const TOKEN_KEY = 'rr_access_token';
export const REFRESH_TOKEN_KEY = 'rr_refresh_token';

// ── Axios instance ────────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// ── REQUEST INTERCEPTOR — inject Bearer token ─────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ── RESPONSE INTERCEPTOR — 401 token refresh ─────────────────────────────────
/**
 * isRefreshing: prevents multiple simultaneous refresh calls.
 * failedQueue:  buffers all requests that arrived while a refresh was in-flight.
 *               On refresh success they are retried; on failure they are rejected.
 */
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token as string);
    }
  });
  failedQueue = [];
};

/** Extend the Axios config type so we can flag a request as already retried. */
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  // Pass successful responses straight through.
  (response) => response,

  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined;

    // Only attempt refresh for 401s that haven't already been retried.
    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry
    ) {
      // ── Another refresh is already in-flight: queue this request ──────────
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          if (originalConfig.headers) {
            originalConfig.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalConfig);
        });
      }

      // ── Start the refresh flow ────────────────────────────────────────────
      originalConfig._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        // No refresh token at all — go straight to login.
        isRefreshing = false;
        processQueue(error, null);
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Use a bare axios call (not apiClient) to avoid triggering this
        // interceptor recursively.
        const { data } = await axios.post(
          `${API_BASE_URL}/${API_VERSION}/auth/refresh`,
          { refreshToken },
        );

        const newAccessToken: string = data.data.session.accessToken;
        const newRefreshToken: string = data.data.session.refreshToken;

        localStorage.setItem(TOKEN_KEY, newAccessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        // Update the default header so future requests use the new token.
        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        // Flush the queue — give every waiting request the new token.
        processQueue(null, newAccessToken);

        // Retry the original request.
        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalConfig);
      } catch (refreshError) {
        // Refresh failed — clear everything and force re-login.
        processQueue(refreshError, null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For all other errors, reject so React Query can handle them.
    return Promise.reject(error);
  },
);

export default apiClient;
