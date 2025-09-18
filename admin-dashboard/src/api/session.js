import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/session";

// ---------------- Create / Start Session ----------------
export const startSession = async (session) => {
  const response = await axios.post(`${API_BASE}/start`, session);
  return response.data;
};

// ---------------- List Sessions ----------------
export const getSessions = async (query = "") => {
  const url = query ? `${API_BASE}/?${query}` : `${API_BASE}/`;
  const response = await axios.get(url);
  return response.data;
};

// ---------------- Get Session by ID ----------------
export const getSessionById = async (sessionId) => {
  const response = await axios.get(`${API_BASE}/${sessionId}`);
  return response.data;
};

// ---------------- Delete Session ----------------
export const deleteSession = async (id) => {
  const response = await axios.delete(`${API_BASE}/${id}`);
  return response.data;
};
