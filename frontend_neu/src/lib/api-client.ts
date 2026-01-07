'use client';

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Utility function to get a cookie value by name
 */
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * API Client für die Kommunikation mit dem Django Backend.
 * 
 * Features:
 * - Automatisches Senden von Session-Cookies (withCredentials)
 * - CSRF Token für modifizierende Requests
 * - Automatisches Token-Refresh bei 401 Fehlern
 * - Weiterleitung zur Login-Seite bei endgültigen Auth-Fehlern
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Track if we're currently refreshing to prevent race conditions
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
  config: InternalAxiosRequestConfig;
}> = [];

const processQueue = (error: Error | null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      // Retry the request
      apiClient.request(prom.config).then(prom.resolve).catch(prom.reject);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor für CSRF Token.
 */
apiClient.interceptors.request.use(
  (config) => {
    const csrfToken = getCookie('csrftoken');
    if (csrfToken && config.method && ['post', 'put', 'patch', 'delete'].includes(config.method.toLowerCase())) {
      config.headers['X-CSRFToken'] = csrfToken;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response Interceptor für Token Refresh und Error Handling.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Skip if we don't have a config or if it's already been retried
    if (!originalRequest || (originalRequest as any)._retry) {
      return Promise.reject(error);
    }

    // Handle 401 errors by trying to refresh the token
    if (error.response?.status === 401) {
      // Prevent retry loops on refresh endpoint itself
      if (originalRequest.url?.includes('/auth/token/refresh/')) {
        // Refresh failed, redirect to login
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/login${currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
        }
        return Promise.reject(error);
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      (originalRequest as any)._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh the token
        await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {}, {
          withCredentials: true,
          headers: { 'Content-Type': 'application/json' },
        });

        // Token refreshed successfully, process queued requests
        processQueue(null);

        // Retry the original request
        return apiClient.request(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear queue and redirect to login
        processQueue(refreshError as Error);

        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          window.location.href = `/login${currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors, just reject
    return Promise.reject(error);
  }
);

export { apiClient };
export default apiClient;
