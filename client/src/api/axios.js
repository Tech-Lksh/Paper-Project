import axios from "axios";

/*
-----------------------------------------
AXIOS INSTANCE
-----------------------------------------
Central backend URL configuration
-----------------------------------------
*/

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json"
  },
  timeout: 10000
});

export default axiosInstance;