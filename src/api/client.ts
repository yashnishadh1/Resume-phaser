import axios, { type InternalAxiosRequestConfig } from 'axios';

let sessionExpiryDispatched = false;
let refreshRequest: Promise<string> | null = null;

interface SessionTokens {
  access_token: string;
  refresh_token?: string;
}

interface RetriableRequest extends InternalAxiosRequestConfig {
  _hirelensRetried?: boolean;
}

function expireSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('userFirstName');
  localStorage.removeItem('userLastName');
  if (!sessionExpiryDispatched) {
    sessionExpiryDispatched = true;
    window.dispatchEvent(new CustomEvent('hirelens:session-expired'));
  }
}

// Base API configuration
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  async (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    if (response.config.url?.endsWith('/auth/login')) sessionExpiryDispatched = false;
    return response;
  },
  async (error) => {
    const status = error.response?.status;
    const originalRequest = error.config as RetriableRequest | undefined;
    const refreshToken = localStorage.getItem('refresh_token');

    if (
      status === 401 && originalRequest && !originalRequest._hirelensRetried &&
      refreshToken && !originalRequest.url?.endsWith('/auth/login')
    ) {
      originalRequest._hirelensRetried = true;
      try {
        if (!refreshRequest) {
          refreshRequest = axios.post<SessionTokens>(
            `${apiClient.defaults.baseURL}/auth/refresh`,
            { refresh_token: refreshToken },
          ).then(({ data }) => {
            if (!data.access_token || !data.refresh_token) throw new Error('Session refresh failed');
            localStorage.setItem('token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            return data.access_token;
          }).finally(() => {
            refreshRequest = null;
          });
        }
        const accessToken = await refreshRequest;
        originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
        return apiClient(originalRequest);
      } catch {
        expireSession();
        return Promise.reject(error);
      }
    }

    if (status === 401 && localStorage.getItem('token')) {
      expireSession();
    } else if (status === 403) {
      window.dispatchEvent(new CustomEvent('hirelens:access-denied'));
    }
    return Promise.reject(error);
  }
);

export default apiClient;
