import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api/v1';

export const getApiUrl = (path = '') => {
  const base = baseURL.replace(/\/$/, '');
  const suffix = path.startsWith('/') ? path : `/${path}`;
  return `${base}${suffix}`;
};

let csrfToken = null;
let isRefreshing = false;
let refreshQueue = [];

const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchCsrfToken = async () => {
  const { data } = await api.get('/auth/csrf');
  csrfToken = data.data.csrfToken;
  return csrfToken;
};

const processQueue = (error) => {
  refreshQueue.forEach((promise) => {
    if (error) promise.reject(error);
    else promise.resolve();
  });
  refreshQueue = [];
};

api.interceptors.request.use(async (config) => {
  const mutatingMethods = ['post', 'put', 'patch', 'delete'];
  if (mutatingMethods.includes(config.method?.toLowerCase())) {
    if (!csrfToken) await fetchCsrfToken();
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/login') &&
      !originalRequest.url?.includes('/auth/register') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/auth/refresh');
        await fetchCsrfToken();
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        csrfToken = null;
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403 && error.response?.data?.error?.code === 'CSRF_ERROR') {
      await fetchCsrfToken();
      originalRequest.headers['X-CSRF-Token'] = csrfToken;
      return api(originalRequest);
    }

    return Promise.reject(error);
  }
);

export const getErrorMessage = (error) => {
  return (
    error.response?.data?.error?.message ||
    error.response?.data?.message ||
    error.message ||
    'Something went wrong'
  );
};

export default api;
