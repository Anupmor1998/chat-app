import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000/api", // Replace with your API base URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response.data?.data; // Modify here to get directly data
  },
  (error) => {
    const errorMessage = error?.response?.data?.message;
    return Promise.reject(errorMessage);
  }
);

export default axiosInstance;
