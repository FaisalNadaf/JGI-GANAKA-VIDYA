import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
});

// Inject the JWT on every request.
api.interceptors.request.use((cfg) => {
  const tok = localStorage.getItem('ip_token');
  if (tok) cfg.headers.Authorization = `Bearer ${tok}`;
  return cfg;
});

// On 401, drop the token so <ProtectedRoute> bounces back to /login.
api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ip_token');
      localStorage.removeItem('ip_admin');
    }
    return Promise.reject(err);
  }
);

export default api;
