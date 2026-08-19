import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL, API_VERSION } from '@/config/api.config';

export const TOKEN_KEY = 'rr_access_token';
export const REFRESH_TOKEN_KEY = 'rr_refresh_token';

const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/${API_VERSION}`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

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

type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

apiClient.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalConfig = error.config as RetryableConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalConfig &&
      !originalConfig._retry
    ) {
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

      originalConfig._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

      if (!refreshToken) {
        isRefreshing = false;
        processQueue(error, null);
        localStorage.removeItem(TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${API_BASE_URL}/${API_VERSION}/auth/refresh`,
          { refreshToken },
        );

        const newAccessToken: string = data.data.session.accessToken;
        const newRefreshToken: string = data.data.session.refreshToken;

        localStorage.setItem(TOKEN_KEY, newAccessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);

        apiClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);

        if (originalConfig.headers) {
          originalConfig.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalConfig);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
