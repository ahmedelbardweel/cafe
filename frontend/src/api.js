import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;
  return `http://${window.location.hostname}:8000`;
};

export const API_BASE_URL = getBaseURL();

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 20000, // 20 seconds timeout - suitable for slow internet
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Attach token if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Retry failed requests once (for slow/unreliable internet)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    // Only retry once on network errors or 5xx, not on 4xx client errors
    if (!config._retry && (!error.response || error.response.status >= 500)) {
      config._retry = true;
      await new Promise(resolve => setTimeout(resolve, 2000)); // wait 2s before retry
      return api(config);
    }
    return Promise.reject(error);
  }
);

export default api;
