import axios from "axios";

const API_BASE = "http://127.0.0.1:8000/admin";

// ---------------- Dashboard Summary ----------------
export const getDashboardSummary = async () => {
  const [drivers, conductors, passengers, vehicles, devices, sessions] =
    await Promise.all([
      axios.get(`${API_BASE}/drivers`),
      axios.get(`${API_BASE}/conductors`),
      axios.get(`${API_BASE}/passengers`),
      axios.get(`${API_BASE}/vehicles`),
      axios.get(`${API_BASE}/devices`),
      axios.get(`${API_BASE}/sessions`),
    ]);

  return {
    drivers: drivers.data.length,
    conductors: conductors.data.length,
    passengers: passengers.data.length,
    vehicles: vehicles.data.length,
    devices: devices.data.length,
    sessions: sessions.data.length,
  };
};
