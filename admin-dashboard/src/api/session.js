import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

// ---------------- Create / Start Session ----------------
export const startSession = async (session) => {
  // session: { driver_id, conductor_id, vehicle_id, start_time }
  const response = await axios.post(`${API_BASE}/session/start`, session);
  return response.data;
};

// ---------------- End Session ----------------
export const endSession = async (sessionId) => {
  const response = await axios.post(`${API_BASE}/session/end/${sessionId}`);
  return response.data;
};

// ---------------- List All Sessions ----------------
export const getSessions = async () => {
  const response = await axios.get(`${API_BASE}/session/`);
  return response.data;
};

// ---------------- Get Session by ID ----------------
export const getSessionById = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/session/${sessionId}`);
  return response.data;
};
