// src/api/admin.js
import client from "./client";

// List all admins
export const getAdmins = async () => {
  const res = await client.get("/admin/admins");
  return res.data;
};

// Create new admin
export const createAdmin = async (adminData) => {
  const res = await client.post("/admin/admins", adminData);
  return res.data;
};

// Update admin
export const updateAdmin = async (id, adminData) => {
  const res = await client.put(`/admin/admins/${id}`, adminData);
  return res.data;
};

// Delete admin
export const deleteAdmin = async (id) => {
  await client.delete(`/admin/admins/${id}`);
};
