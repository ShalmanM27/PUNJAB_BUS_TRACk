import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

// ---------------- Health Check ----------------
export const getHealthStatus = async () => {
  const response = await axios.get(`${API_BASE}/health`);
  return response.data; // { status: "ok" }
};
