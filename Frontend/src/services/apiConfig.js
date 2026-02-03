import axios from "axios";

let BASEURL = "";

if (import.meta.env.DEV) {
  BASEURL = import.meta.env.VITE_URL_WHEN_DEV;
} else {
  BASEURL = import.meta.env.VITE_URL_WHEN_PROD;
}

const AxiosInstance = axios.create({
  baseURL: BASEURL + "/api/v1",
  withCredentials: true,
});

// Intercept the request
AxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

AxiosInstance.interceptors.response.use(
  (response) => response, // success → just pass through

  async (error) => {
    const originalRequest = error.config;

    // Not 401 or already tried refresh → reject immediately
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Mark as already retried so we don't loop forever
    originalRequest._retry = true;

    try {
      // Try to refresh → backend will set new refresh cookie + return new access token
      await AxiosInstance.get("/users/refresh");

      // Refresh succeeded → retry original request (cookie + new access token should work)
      return AxiosInstance(originalRequest);
    } catch (refreshError) {
      // Refresh failed → probably invalid/expired refresh token
      console.warn("Refresh token failed → logging out");

      // You can also clear localStorage / context here if you store anything
      localStorage.removeItem("jwt");
      window.location.href = "/login";

      return Promise.reject(refreshError);
    }
  },
);

export { AxiosInstance };
