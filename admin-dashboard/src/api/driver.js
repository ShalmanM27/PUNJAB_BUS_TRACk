// src/api/driver.js
import client from "./client";

// List all drivers
export const getDrivers = async () => {
  const res = await client.get("/admin/drivers");
  return res.data;
};

// Create new driver
export const createDriver = async (driverData) => {
  const res = await client.post("/admin/drivers", driverData);
  return res.data;
};

// Update driver
export const updateDriver = async (id, driverData) => {
  const res = await client.put(`/admin/drivers/${id}`, driverData);
  return res.data;
};

// Delete driver
export const deleteDriver = async (id) => {
  await client.delete(`/admin/drivers/${id}`);
};
