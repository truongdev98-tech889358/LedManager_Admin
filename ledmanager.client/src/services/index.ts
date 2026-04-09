import { getToken, removeToken } from "@/utils/auth";
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || "",
});

// Request interceptor: luôn gắn token
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }    
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
     
    }
    return Promise.reject(error);
  },
);

export default api;
