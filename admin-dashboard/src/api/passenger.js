// src/api/passenger.js
import client from "./client";

// List passengers
export const getPassengers = async () => {
  const res = await client.get("/admin/passengers");
  return res.data;
};

// Get single passenger
export const getPassenger = async (id) => {
  const res = await client.get(`/admin/passengers/${id}`);
  return res.data;
};

// Delete passenger
export const deletePassenger = async (id) => {
  await client.delete(`/admin/passengers/${id}`);
};