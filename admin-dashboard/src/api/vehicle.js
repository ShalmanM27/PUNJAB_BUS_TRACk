// src/api/vehicle.js
import client from "./client";

// List all vehicles
export const getVehicles = async () => {
  const res = await client.get("/vehicle");
  return res.data;
};

// Get single vehicle
export const getVehicle = async (id) => {
  const res = await client.get(`/vehicle/${id}`);
  return res.data;
};

// Create vehicle
export const createVehicle = async (vehicle) => {
  const res = await client.post("/vehicle", vehicle);
  return res.data;
};

// Update vehicle
export const updateVehicle = async (id, vehicle) => {
  const res = await client.put(`/vehicle/${id}`, vehicle);
  return res.data;
};

// Delete vehicle
export const deleteVehicle = async (id) => {
  await client.delete(`/vehicle/${id}`);
};

// Assign driver
export const assignDriver = async (vehicle_id, driver_id) => {
  const res = await client.put(
    `/assign/vehicle/${vehicle_id}/assign-driver/${driver_id}`
  );
  return res.data;
};

// Assign conductor
export const assignConductor = async (vehicle_id, conductor_id) => {
  const res = await client.put(
    `/assign/vehicle/${vehicle_id}/assign-conductor/${conductor_id}`
  );
  return res.data;
};
