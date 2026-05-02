import axios from "axios";
import {
  clearAuthSession,
  getAccessDeniedLoginUrl,
  getRoleFromPath,
  getStoredAuthRole,
} from "../utils/authRedirect";

const apiBaseURL =
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? "http://localhost:5001/api" : "/api");

export const apiClient = axios.create({
  baseURL: apiBaseURL,
  timeout: 60000,
  headers: {
    "Content-Type": "application/json",
  },
});

export function warmApi() {
  return apiClient.get("/health", {
    timeout: 60000,
  });
}

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";
    const isAuthRequest = requestUrl.includes("/auth/");

    if (status === 403 && !isAuthRequest && typeof window !== "undefined") {
      const role = getRoleFromPath() || getStoredAuthRole() || "student";
      const loginUrl = getAccessDeniedLoginUrl(role);

      clearAuthSession();

      if (window.location.pathname !== loginUrl.split("?")[0]) {
        window.location.assign(loginUrl);
      }
    }

    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  return error?.response?.data?.message || error?.message || fallback;
}
