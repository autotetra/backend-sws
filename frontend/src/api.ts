import axios from "axios";

/**
 * Central Axios instance for API communication.
 * - Uses HTTP-only cookies for auth (withCredentials)
 * - Base URL is controlled via environment variable
 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5050/api",
  withCredentials: true,
});

export default api;
