import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

// ---------------- Create Audit Log ----------------
export const createAuditLog = async (log) => {
  // log: { user_id, action, details }
  const response = await axios.post(`${API_BASE}/audit/`, log);
  return response.data;
};

// ---------------- List Audit Logs ----------------
export const listAuditLogs = async () => {
  const response = await axios.get(`${API_BASE}/audit/`);
  return response.data;
};

// ---------------- Get Audit Log by ID ----------------
export const getAuditLogById = async (auditId) => {
  const response = await axios.get(`${API_BASE}/audit/${auditId}`);
  return response.data;
};