import React, { useEffect, useState } from "react";
import api from "../api"; // import the Axios instance

const Dashboard = () => {
  const [summary, setSummary] = useState({
    drivers: 0,
    conductors: 0,
    passengers: 0,
    vehicles: 0,
    devices: 0,
    sessions: 0,
  });

  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      const [driversRes, conductorsRes, passengersRes, vehiclesRes, devicesRes, sessionsRes] = await Promise.all([
        api.get("/drivers"),
        api.get("/conductors"),
        api.get("/passengers"),
        api.get("/vehicles"),
        api.get("/devices"),
        api.get("/sessions"),
      ]);

      setSummary({
        drivers: driversRes.data.length,
        conductors: conductorsRes.data.length,
        passengers: passengersRes.data.length,
        vehicles: vehiclesRes.data.length,
        devices: devicesRes.data.length,
        sessions: sessionsRes.data.length,
      });
    } catch (err) {
      console.error("Failed to fetch dashboard summary:", err);
      setError("Failed to fetch dashboard summary. Please check your backend connection.");
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (error) {
    return <div style={{ padding: "20px", color: "red" }}>{error}</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>Dashboard Summary</h2>
      <ul>
        <li>Drivers: {summary.drivers}</li>
        <li>Conductors: {summary.conductors}</li>
        <li>Passengers: {summary.passengers}</li>
        <li>Vehicles: {summary.vehicles}</li>
        <li>Devices: {summary.devices}</li>
        <li>Sessions: {summary.sessions}</li>
      </ul>
    </div>
  );
};

export default Dashboard;
