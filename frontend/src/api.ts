import axios from "axios";

// Axios instance with pre-configured options
const api = axios.create({
  baseURL: "http://localhost:5050/api",
  withCredentials: true,
});

export default api;
