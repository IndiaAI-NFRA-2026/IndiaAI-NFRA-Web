import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosRequestHeaders, AxiosResponse } from 'axios';
import { createAxios as createHttpClient } from './_http/axios';
import { clearAuthTokens, getAccessToken, getRefreshToken, saveAuthTokens, type TokenResponse } from '@/lib/utils/auth';
import { URL_REFRESH_TOKEN } from '@/constants/endpoints';

const defaultAxiosConfig: AxiosRequestConfig = {
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/${process.env.NEXT_PUBLIC_API_VERSION}`,
  timeout: 30000,
};
// Read refresh token from localStorage via auth utils
export const getRefreshTokenFromStorage = () => getRefreshToken();
export const refreshAccessToken = async () => {
  const httpClient = createHttpClient();
  const refreshToken = getRefreshTokenFromStorage();
  const { data } = await httpClient.post(URL_REFRESH_TOKEN, {
    refresh_token: refreshToken,
  });

  // Backend returns token payload under data.data
  const tokenResponse = data.data as TokenResponse;
  // Persist new tokens to localStorage
  saveAuthTokens(tokenResponse);

  return tokenResponse.access_token;
};

const transformResponse = (response: AxiosResponse) => {
  if (response?.data) {
    return {
      ...response,
      data: response.data,
    };
  }
  return response;
};

// Flag & queue to prevent multiple simultaneous refresh calls
let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

const subscribeTokenRefresh = (callback: (token: string | null) => void) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token: string | null) => {
  for (const callback of refreshSubscribers) {
    callback(token);
  }
  refreshSubscribers = [];
};

const handleError = async (error: AxiosError, axiosInstance: AxiosInstance) => {
  const status = error.response?.status || error.status;
  const originalRequest = error.config as AxiosRequestConfig & {
    _retry?: boolean;
  };

  // Auto refresh token on 401
  if (status === 401 && originalRequest && !originalRequest._retry && originalRequest.url !== URL_REFRESH_TOKEN) {
    originalRequest._retry = true;

    // If a refresh is already in progress, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (!token) {
            clearAuthTokens();
            reject(error);
            return;
          }

          originalRequest.headers ??= {};
          (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${token}`;

          resolve(axiosInstance(originalRequest));
        });
      });
    }

    // Start a new refresh flow
    isRefreshing = true;
    try {
      const newAccessToken = await refreshAccessToken();
      isRefreshing = false;
      onRefreshed(newAccessToken);

      if (!newAccessToken) {
        clearAuthTokens();
        throw error;
      }

      originalRequest.headers ??= {};
      (originalRequest.headers as Record<string, string>).Authorization = `Bearer ${newAccessToken}`;

      return axiosInstance(originalRequest);
    } catch (err) {
      isRefreshing = false;
      onRefreshed(null);
      clearAuthTokens();
      throw err;
    }
  }

  // For other 401 cases (e.g., refresh failed), just clear tokens
  if (status === 401) {
    clearAuthTokens();
  }

  throw error;
};

const api = axios.create({
  ...defaultAxiosConfig,
  headers: {
    ...defaultAxiosConfig.headers,
  },
});
api.interceptors.request.use((config) => {
  const accessToken = getAccessToken();
  if (accessToken) {
    config.headers ??= {} as AxiosRequestHeaders;
    (config.headers as Record<string, string>).Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
api.interceptors.response.use(transformResponse, (error) => {
  return handleError(error, api);
});

export default api;
