import axios from "axios";

export const getBackendBaseUrl = () => {
  const envVal = import.meta.env.VITE_API_BASE_URL;
  if (typeof window !== "undefined" && !["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    if (!envVal || envVal.includes("localhost") || envVal.includes("127.0.0.1")) {
      return "https://bookhub-y44c.onrender.com/api";
    }
  }
  return envVal || "http://localhost:5001/api";
};

export const toAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const base = getBackendBaseUrl().replace(/\/api\/?$/, "");
  return `${base}/${path.replace(/\\/g, "/")}`;
};

const api = axios.create({
  baseURL: getBackendBaseUrl(),
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
