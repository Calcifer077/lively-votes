import axios from "axios";

const AxiosInstance = axios.create({
  baseURL: "http://localhost:3000/api/v1",
});

AxiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwt");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export { AxiosInstance };
