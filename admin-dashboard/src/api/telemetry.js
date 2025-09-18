import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

// ---------------- Record Telemetry ----------------
export const recordTelemetry = async (telemetry) => {
  // telemetry: { vehicle_id, latitude, longitude, speed }
  const response = await axios.post(`${API_BASE}/telemetry/`, telemetry);
  return response.data;
};

// ---------------- List Telemetry for a Vehicle ----------------
export const getTelemetryByVehicle = async (vehicleId) => {
  const response = await axios.get(`${API_BASE}/telemetry/vehicle/${vehicleId}`);
  return response.data;
};

// ---------------- Get Latest Telemetry for a Vehicle ----------------
export const getLatestTelemetry = async (vehicleId) => {
  const response = await axios.get(`${API_BASE}/telemetry/vehicle/${vehicleId}/latest`);
  return response.data;
};
