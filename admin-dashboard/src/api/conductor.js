// src/api/conductor.js
import client from "./client";

// List conductors
export const getConductors = async () => {
  const res = await client.get("/admin/conductors");
  return res.data;
};

// Create conductor
export const createConductor = async (data) => {
  const res = await client.post("/admin/conductors", data);
  return res.data;
};

// Update conductor
export const updateConductor = async (id, data) => {
  const res = await client.put(`/admin/conductors/${id}`, data);
  return res.data;
};

// Delete conductor
export const deleteConductor = async (id) => {
  await client.delete(`/admin/conductors/${id}`);
};
