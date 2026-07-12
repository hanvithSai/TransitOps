import axios from 'axios';
import { mockData } from './mockData';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // send cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor: attach access token ──────────────────
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor: handle 401 with token refresh & fallback to mock data ───────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const getMockDataForUrl = (url, method) => {
  if (url.includes('/auth/login')) return mockData.auth.login;
  if (url.includes('/auth/refresh')) return mockData.auth.refresh;
  if (url.includes('/dashboard/stats')) return mockData.dashboard.stats;
  if (url.includes('/vehicles') && method === 'get') return mockData.vehicles.list;
  if (url.includes('/drivers') && method === 'get') return mockData.drivers.list;
  if (url.includes('/trips') && method === 'get') return mockData.trips.list;
  if (url.includes('/maintenance') && method === 'get') return mockData.maintenance.list;
  if (url.includes('/fuel') && method === 'get') return mockData.finance.fuel;
  if (url.includes('/expenses') && method === 'get') return mockData.finance.expenses;
  if (url.includes('/users') && method === 'get') return mockData.users.list;
  
  // Return a generic success mock for mutations
  if (method !== 'get') return { data: { success: true } };
  return { data: {} };
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error or 5xx - Fallback to mock data
    if (!error.response || error.response.status >= 500) {
      console.warn(`[API Fallback] Using mock data for ${originalRequest.method.toUpperCase()} ${originalRequest.url}`);
      return Promise.resolve({ data: getMockDataForUrl(originalRequest.url, originalRequest.method) });
    }

    // If 401 and not already retrying (and not the refresh endpoint itself)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
        // Queue this request until refresh is done
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.data.accessToken;
        localStorage.setItem('accessToken', newToken);
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // For other errors (4xx), try to fallback if it's a login error (to allow mock login)
    if (originalRequest.url?.includes('/auth/login')) {
      console.warn(`[API Fallback] Using mock data for Login`);
      return Promise.resolve({ data: getMockDataForUrl(originalRequest.url, originalRequest.method) });
    }

    return Promise.reject(error);
  }
);

export default api;
