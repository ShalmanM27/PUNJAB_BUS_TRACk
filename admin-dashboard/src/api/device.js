import axios from "./client";

// Fetch all devices
export const getDevices = async () => {
  const res = await axios.get("/device/");
  return res.data;
};

// Fetch device by ID
export const getDeviceById = async (deviceId) => {
  const res = await axios.get(`/device/${deviceId}`);
  return res.data;
};

// Register new device
export const registerDevice = async (deviceData) => {
  const res = await axios.post("/device/register", deviceData);
  return res.data;
};

// Update device
export const updateDevice = async (deviceId, updateData) => {
  const res = await axios.put(`/device/${deviceId}`, updateData);
  return res.data;
};

// Attest device
export const attestDevice = async (deviceId, attested, attestationHash) => {
  const res = await axios.post(`/device/${deviceId}/attest`, {
    attested,
    attestation_hash: attestationHash,
  });
  return res.data;
};

// Assign device to user
export const assignDevice = async (deviceId, userId, deviceType) => {
  const res = await axios.post(`/device/${deviceId}/assign`, {
    user_id: userId,
    device_type: deviceType,
  });
  return res.data;
};
