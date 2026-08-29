import axios, { AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config/constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cache & in-flight request tracker for GET requests
const inFlightRequests = new Map<string, Promise<any>>();
const shortGetCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 3000; // 3 seconds cache for identical GET requests

// Helper to generate unique key for GET requests
const getRequestKey = (config: AxiosRequestConfig): string | null => {
  if (config.method && config.method.toUpperCase() !== 'GET') return null;
  const url = config.url || '';
  const params = config.params ? JSON.stringify(config.params) : '';
  return `${url}?${params}`;
};

api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    // Cache successful GET responses briefly
    const key = getRequestKey(response.config);
    if (key) {
      shortGetCache.set(key, { data: response, timestamp: Date.now() });
    }
    return response;
  },
  async (error) => {
    const config = error.config;

    // Handle 429 Too Many Requests with automatic backoff & retry
    if (error.response?.status === 429 && config) {
      config._retryCount = config._retryCount || 0;
      const MAX_RETRIES = 3;

      if (config._retryCount < MAX_RETRIES) {
        config._retryCount += 1;
        const delay = Math.min(1000 * Math.pow(1.5, config._retryCount) + Math.random() * 300, 3500);
        console.warn(`[API 429 Rate Limit] Retrying ${config.url} (Attempt ${config._retryCount}/${MAX_RETRIES}) after ${Math.round(delay)}ms...`);
        
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !config?.url?.includes('/login')) {
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('adminProfile');
      sessionStorage.removeItem('userRole');
      sessionStorage.removeItem('userEmail');
      sessionStorage.removeItem('userName');
      localStorage.removeItem('currentView');
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
    return Promise.reject(error);
  }
);

// Wrapper to provide transparent in-flight request deduplication
const originalGet = api.get.bind(api);
api.get = (url: string, config?: AxiosRequestConfig) => {
  const fullConfig: AxiosRequestConfig = { ...(config || {}), method: 'GET', url };
  const key = getRequestKey(fullConfig);

  if (!key) {
    return originalGet(url, config);
  }

  // 1. Check short-lived cache
  const cached = shortGetCache.get(key);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
    return Promise.resolve(cached.data);
  }

  // 2. Check in-flight request
  if (inFlightRequests.has(key)) {
    return inFlightRequests.get(key)!;
  }

  // 3. Execute new request and store in-flight promise
  const promise = originalGet(url, config)
    .then((res) => {
      shortGetCache.set(key, { data: res, timestamp: Date.now() });
      return res;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, promise);
  return promise;
};

export default api;
