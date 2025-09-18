import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

export const getAssignments = async () => {
  const response = await axios.get(`${API_BASE}/assign/assignments`);
  return response.data;
};

export const getAssignmentById = async (assignmentId) => {
  const response = await axios.get(`${API_BASE}/assign/assignments/${assignmentId}`);
  return response.data;
};

export const createAssignment = async (assignment) => {
  // assignment: { vehicle_id, driver_id, route_id, timestamp }
  const response = await axios.post(`${API_BASE}/assign/assign-driver`, assignment);
  return response.data;
};

export const assignDriverToVehicle = async (vehicleId, driverId) => {
  const response = await axios.put(
    `${API_BASE}/assign/vehicle/${vehicleId}/assign-driver/${driverId}`
  );
  return response.data;
};

export const assignConductorToVehicle = async (vehicleId, conductorId) => {
  const response = await axios.put(
    `${API_BASE}/assign/vehicle/${vehicleId}/assign-conductor/${conductorId}`
  );
  return response.data;
};

export const bindDeviceToUser = async (deviceId, userId, deviceType) => {
  const response = await axios.post(`${API_BASE}/assign/bind-device`, {
    device_id: deviceId,
    user_id: userId,
    device_types: deviceType,
  });
  return response.data;
};

export const attestDevice = async (deviceId, attested, attestationHash) => {
  const response = await axios.post(`${API_BASE}/assign/attest-device`, {
    device_id: deviceId,
    attested,
    attestation_hash: attestationHash,
  });
  return response.data;
};
