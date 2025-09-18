import React, { useEffect, useState } from "react";
import { getHealthStatus } from "../api/health";

const HealthCheck = () => {
  const [status, setStatus] = useState("Checking...");

  const fetchHealth = async () => {
    try {
      const data = await getHealthStatus();
      setStatus(data.status || "Unknown");
    } catch (err) {
      setStatus("Error connecting to API");
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 5000); // auto refresh every 5s
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>Backend Health Status</h1>
      <p>Status: {status}</p>
    </div>
  );
};

export default HealthCheck;
