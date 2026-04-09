import { getToken } from "@/utils/auth";
import axios from "axios";

const apiCMS = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL_CMS || "",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor: luôn gắn token
apiCMS.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (!token) {
      delete config.headers.Authorization;
      return config;
    }
    config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error),
);

apiCMS.interceptors.response.use(
  (response) => response,
  (error) => {
    
    return Promise.reject(error);
  },
);

export default apiCMS;
