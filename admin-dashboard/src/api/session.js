// src/api/session.js
import client from "./client";

const BASE = "/session";

// ---------------- List Sessions ----------------
export const getSessions = async () => {
  const res = await client.get(`${BASE}/`);
  return res.data;
};

// ---------------- Create / Start Session ----------------
export const createSession = async (sessionData) => {
  const res = await client.post(`${BASE}/start`, sessionData);
  return res.data;
};

// ---------------- Update Session ----------------
export const updateSession = async (id, sessionData) => {
  const res = await client.put(`${BASE}/${id}`, sessionData);
  return res.data;
};

// ---------------- Delete Session ----------------
export const deleteSession = async (id) => {
  await client.delete(`${BASE}/${id}`);
};

// ---------------- Get Session by ID ----------------
export const getSessionById = async (id) => {
  const res = await client.get(`${BASE}/${id}`);
  return res.data;
};

// ---------------- Get Upcoming Session for Vehicle ----------------
export const getUpcomingSessionForVehicle = async (vehicleId) => {
  const res = await client.get(`/session/vehicle/${vehicleId}/upcoming`);
  return res.data;
};
