import axios from 'axios';
import { mockData } from './mockData';

const isDev = import.meta.env.DEV;
const REQUEST_TIMEOUT_MS = isDev ? 30_000 : 90_000;
const MAX_NETWORK_RETRIES = 2;
const RETRY_DELAY_MS = 5_000;

export const BACKEND_STATUS = {
  CHECKING: 'checking',
  ONLINE: 'online',
  SLOW: 'slow',
  OFFLINE: 'offline',
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: REQUEST_TIMEOUT_MS,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Backend connectivity ───────────────────────────────────────
let backendStatus = BACKEND_STATUS.CHECKING;
const statusListeners = new Set();

export const getBackendStatus = () => backendStatus;

export const subscribeBackendStatus = (listener) => {
  statusListeners.add(listener);
  listener(backendStatus);
  return () => statusListeners.delete(listener);
};

const setBackendStatus = (status) => {
  if (backendStatus === status) return;
  backendStatus = status;
  statusListeners.forEach((fn) => fn(status));
};

export const isNetworkError = (error) => (
  !error?.response
  || error.code === 'ECONNABORTED'
  || error.code === 'ERR_NETWORK'
);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getHealthUrl = () => {
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
  return `${base}/health`;
};

/** Ping health endpoint — useful on app load and after cold starts. */
export const warmBackend = async () => {
  setBackendStatus(BACKEND_STATUS.CHECKING);
  try {
    await axios.get(getHealthUrl(), { timeout: REQUEST_TIMEOUT_MS });
    setBackendStatus(BACKEND_STATUS.ONLINE);
    return true;
  } catch {
    setBackendStatus(BACKEND_STATUS.OFFLINE);
    return false;
  }
};

// ── Demo mode (local dev only) ─────────────────────────────────
let demoModeActive = false;
const demoListeners = new Set();

export const isDemoMode = () => demoModeActive;

export const subscribeDemoMode = (listener) => {
  demoListeners.add(listener);
  listener(demoModeActive);
  return () => demoListeners.delete(listener);
};

let onTokenRefresh = null;

export const setTokenRefreshHandler = (handler) => {
  onTokenRefresh = handler;
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
const isIdempotentRequest = (config = {}) => {
  const method = (config.method || 'get').toLowerCase();
  return method === 'get' || method === 'head';
};

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

const retryNetworkRequest = async (originalRequest) => {
  const retryCount = originalRequest._networkRetryCount || 0;
  if (retryCount >= MAX_NETWORK_RETRIES || !isIdempotentRequest(originalRequest)) {
    return null;
  }

  originalRequest._networkRetryCount = retryCount + 1;
  setBackendStatus(BACKEND_STATUS.SLOW);
  await sleep(RETRY_DELAY_MS);
  return api(originalRequest);
};

api.interceptors.response.use(
  (response) => {
    setBackendStatus(BACKEND_STATUS.ONLINE);
    setDemoMode(false);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest) return Promise.reject(error);

    if (isNetworkError(error)) {
      const retried = await retryNetworkRequest(originalRequest);
      if (retried) return retried;
    }

    if (!error.response || error.response.status >= 500) {
      if (isNetworkError(error)) {
        setBackendStatus(BACKEND_STATUS.OFFLINE);
      }

      if (isAuthEndpoint(originalRequest.url)) {
        return Promise.reject(error);
      }

      if (isDev) {
        return resolveWithMock(originalRequest);
      }

      return Promise.reject(error);
    }

    if (
      error.response?.status === 401
      && !originalRequest._retry
      && !originalRequest.url?.includes('/auth/refresh')
      && !originalRequest.url?.includes('/auth/login')
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
        if (data.data.user && onTokenRefresh) {
          onTokenRefresh(data.data.user);
        }
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

    if (error.response?.status === 403 && error.response?.data?.requiresPasswordChange) {
      if (!window.location.pathname.startsWith('/update-password')) {
        window.location.href = '/update-password';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
