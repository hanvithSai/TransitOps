import axios from 'axios';
import { mockData } from './mockData';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Demo mode tracking ─────────────────────────────────────────
let demoModeActive = false;
const demoListeners = new Set();

export const isDemoMode = () => demoModeActive;

export const subscribeDemoMode = (listener) => {
  demoListeners.add(listener);
  listener(demoModeActive);
  return () => demoListeners.delete(listener);
};

const setDemoMode = (active) => {
  if (demoModeActive === active) return;
  demoModeActive = active;
  demoListeners.forEach((fn) => fn(active));
};

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

// ── Response interceptor ──────────────────────────────────────
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const isAuthEndpoint = (url = '') => url.includes('/auth/');

const getMockDataForUrl = (url, method) => {
  if (url.includes('/dashboard/stats')) return mockData.dashboard.stats;
  if (url.includes('/vehicles') && method === 'get') return mockData.vehicles.list;
  if (url.includes('/drivers') && method === 'get') return mockData.drivers.list;
  if (url.includes('/trips') && method === 'get') return mockData.trips.list;
  if (url.includes('/maintenance') && method === 'get') return mockData.maintenance.list;
  if (url.includes('/fuel') && method === 'get') return mockData.finance.fuel;
  if (url.includes('/expenses') && method === 'get') return mockData.finance.expenses;
  if (url.includes('/users') && method === 'get') return mockData.users.list;
  if (url.includes('/reports/roi') && method === 'get') return mockData.reports.roi;

  if (method !== 'get') return { data: { success: true } };
  return { data: {} };
};

const resolveWithMock = (originalRequest) => {
  setDemoMode(true);
  console.warn(`[API Fallback] Using mock data for ${originalRequest.method.toUpperCase()} ${originalRequest.url}`);
  return Promise.resolve({ data: getMockDataForUrl(originalRequest.url, originalRequest.method) });
};

api.interceptors.response.use(
  (response) => {
    setDemoMode(false);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (!error.response || error.response.status >= 500) {
      if (isAuthEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }
      return resolveWithMock(originalRequest);
    }

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/refresh') &&
      !originalRequest.url?.includes('/auth/login')
    ) {
      if (isRefreshing) {
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

    return Promise.reject(error);
  }
);

export default api;
