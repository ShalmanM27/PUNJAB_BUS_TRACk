import React, { useEffect, useState } from "react";
import { getTelemetryByVehicle, getLatestTelemetry, recordTelemetry } from "../api/telemetry";

const Telemetry = () => {
  const [vehicleId, setVehicleId] = useState("");
  const [telemetryList, setTelemetryList] = useState([]);
  const [latestTelemetry, setLatestTelemetry] = useState(null);
  const [newTelemetry, setNewTelemetry] = useState({
    vehicle_id: "",
    latitude: 0,
    longitude: 0,
    speed: 0,
  });

  const fetchTelemetry = async () => {
    if (!vehicleId) return;
    const list = await getTelemetryByVehicle(vehicleId);
    setTelemetryList(list);
    const latest = await getLatestTelemetry(vehicleId);
    setLatestTelemetry(latest);
  };

  useEffect(() => {
    if (vehicleId) fetchTelemetry();
  }, [vehicleId]);

  const handleRecordTelemetry = async () => {
    try {
      await recordTelemetry(newTelemetry);
      alert("Telemetry recorded!");
      if (newTelemetry.vehicle_id === vehicleId) fetchTelemetry();
    } catch (err) {
      console.error(err);
      alert("Failed to record telemetry.");
    }
  };

  return (
    <div>
      <h1>Telemetry Management</h1>

      <div>
        <h2>Record Telemetry</h2>
        <input
          type="text"
          placeholder="Vehicle ID"
          value={newTelemetry.vehicle_id}
          onChange={(e) => setNewTelemetry({ ...newTelemetry, vehicle_id: e.target.value })}
        />
        <input
          type="number"
          placeholder="Latitude"
          value={newTelemetry.latitude}
          onChange={(e) => setNewTelemetry({ ...newTelemetry, latitude: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Longitude"
          value={newTelemetry.longitude}
          onChange={(e) => setNewTelemetry({ ...newTelemetry, longitude: parseFloat(e.target.value) })}
        />
        <input
          type="number"
          placeholder="Speed"
          value={newTelemetry.speed}
          onChange={(e) => setNewTelemetry({ ...newTelemetry, speed: parseFloat(e.target.value) })}
        />
        <button onClick={handleRecordTelemetry}>Record Telemetry</button>
      </div>

      <div>
        <h2>View Telemetry</h2>
        <input
          type="text"
          placeholder="Vehicle ID"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        />
        <button onClick={fetchTelemetry}>Fetch Telemetry</button>

        <h3>Latest Telemetry</h3>
        {latestTelemetry ? (
          <div>
            Lat: {latestTelemetry.latitude}, Lng: {latestTelemetry.longitude}, Speed: {latestTelemetry.speed}
          </div>
        ) : (
          <div>No telemetry available</div>
        )}

        <h3>All Telemetry</h3>
        <ul>
          {telemetryList.map((t) => (
            <li key={t.id}>
              {t.timestamp}: Lat {t.latitude}, Lng {t.longitude}, Speed {t.speed}, ETA {t.eta_to_next_stop || "-"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Telemetry;
