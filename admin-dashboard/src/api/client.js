// src/api/client.js
import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:8000", // backend base URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: attach JWT token if authentication is added
client.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
