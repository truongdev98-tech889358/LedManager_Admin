import { getToken, removeToken } from "@/utils/auth";
import axios from "axios";

const apiUser = axios.create({
  // baseURL: import.meta.env.VITE_BASE_URL_USER || "", 
  // Commented out to use relative path for proxy
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: luôn gắn token
apiUser.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }    
    return config;
  },
  (error) => Promise.reject(error),
);

apiUser.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();

    }
    return Promise.reject(error);
  },
);

export default apiUser;
