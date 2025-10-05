import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const http = axios.create({ baseURL, withCredentials: true });

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;

// Global response interceptor for auth errors
http.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;
    // allow individual requests to opt out of auto-logout behavior by setting
    // `skipAuthLogout` on the axios request config
    const skip = error?.config?.skipAuthLogout;
    if ((status === 401 || status === 403) && !skip) {
      try {
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
      } catch {}
      const reason = status === 401 ? 'unauthorized' : 'forbidden';
      const url = `/login?from=${encodeURIComponent(window.location.pathname)}&reason=${reason}`;
      if (window.location.pathname !== '/login') window.location.href = url;
    }
    return Promise.reject(error);
  }
);
