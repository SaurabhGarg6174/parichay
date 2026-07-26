import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api/v1';
export const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || 'http://localhost:8081';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Access tokens are short-lived by design. Instead of forcing a full re-login every time one
// expires, a single 401 triggers a silent refresh via the long-lived refresh token, and the
// original request is retried once with the new access token.
const AUTH_ROUTES_WITHOUT_REFRESH = ['/auth/login', '/auth/register', '/auth/refresh-token'];

let isRefreshing = false;
let pendingRequests: Array<(newToken: string | null) => void> = [];

const clearSessionAndRedirect = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const isUnauthorized = error.response?.status === 401;
    const isAuthRoute = AUTH_ROUTES_WITHOUT_REFRESH.some((path) => originalRequest?.url?.includes(path));

    if (!isUnauthorized || !originalRequest || isAuthRoute) {
      return Promise.reject(error);
    }

    if (originalRequest._retriedAfterRefresh) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    if (!refreshToken) {
      clearSessionAndRedirect();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push((newToken) => {
          if (!newToken) {
            reject(error);
            return;
          }
          originalRequest._retriedAfterRefresh = true;
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
      const newToken = data.data.token as string;
      const newRefreshToken = data.data.refreshToken as string;

      localStorage.setItem('token', newToken);
      localStorage.setItem('refreshToken', newRefreshToken);

      pendingRequests.forEach((cb) => cb(newToken));
      pendingRequests = [];

      originalRequest._retriedAfterRefresh = true;
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return api(originalRequest);
    } catch (refreshError) {
      pendingRequests.forEach((cb) => cb(null));
      pendingRequests = [];
      clearSessionAndRedirect();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
