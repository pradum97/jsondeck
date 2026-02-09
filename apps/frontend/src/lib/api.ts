import axios, { AxiosError, AxiosInstance } from "axios";
import { publicEnv } from "@/lib/public-env";

const baseURL = publicEnv.apiUrl;

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true
});

const refreshClient = axios.create({
  baseURL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach((resolve) => resolve(token));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    if ((originalRequest as { _retry?: boolean })._retry) {
      return Promise.reject(error);
    }

    (originalRequest as { _retry?: boolean })._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((token) => {
          if (!token) {
            reject(error);
            return;
          }
          originalRequest.headers = originalRequest.headers ?? {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshResponse = await refreshClient.post<{ accessToken: string }>("/api/auth/refresh");
      const refreshData = refreshResponse.data;

      setAccessToken(refreshData.accessToken);
      processQueue(refreshData.accessToken);

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${refreshData.accessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      setAccessToken(null);
      processQueue(null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
