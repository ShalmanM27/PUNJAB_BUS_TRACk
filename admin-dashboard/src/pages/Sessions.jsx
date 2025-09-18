import React, { useEffect, useState } from "react";
import { getSessions, startSession, deleteSession } from "../api/session";
import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";

const getNowISOString = () => {
  const now = new Date();
  now.setSeconds(0, 0);
  return now.toISOString().slice(0, 16);
};

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    driver_id: "",
    conductor_id: "",
    vehicle_id: "",
    start_time: getNowISOString(),
  });
  const [search, setSearch] = useState({
    driver_id: "",
    conductor_id: "",
    vehicle_id: "",
  });

  const fetchSessions = async () => {
    const params = {};
    if (search.driver_id) params.driver_id = search.driver_id;
    if (search.conductor_id) params.conductor_id = search.conductor_id;
    if (search.vehicle_id) params.vehicle_id = search.vehicle_id;
    params.only_live_upcoming = true;
    const query = new URLSearchParams(params).toString();
    const data = await getSessions(query);
    setSessions(data);
  };

  useEffect(() => {
    fetchSessions();
    // eslint-disable-next-line
  }, [search]);

  // Reset start_time to now when opening the form
  useEffect(() => {
    setNewSession((prev) => ({
      ...prev,
      start_time: getNowISOString(),
    }));
  }, []);

  const handleStartSession = async () => {
    try {
      await startSession(newSession);
      fetchSessions();
      alert("Session started successfully!");
      setNewSession({
        driver_id: "",
        conductor_id: "",
        vehicle_id: "",
        start_time: getNowISOString(),
      });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.detail || "Failed to start session.");
    }
  };

  const handleDeleteSession = async (id) => {
    if (!window.confirm("Are you sure you want to delete this session?")) return;
    try {
      await deleteSession(id);
      fetchSessions();
    } catch (err) {
      alert("Failed to delete session.");
    }
  };

  return (
    <div>
      <h1>Sessions Management</h1>

      <div>
        <h2>Search Sessions</h2>
        <input
          type="text"
          placeholder="Driver ID"
          value={search.driver_id}
          onChange={(e) => setSearch({ ...search, driver_id: e.target.value })}
        />
        <input
          type="text"
          placeholder="Conductor ID"
          value={search.conductor_id}
          onChange={(e) =>
            setSearch({ ...search, conductor_id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Vehicle ID"
          value={search.vehicle_id}
          onChange={(e) =>
            setSearch({ ...search, vehicle_id: e.target.value })
          }
        />
        <button onClick={fetchSessions}>Search</button>
      </div>

      <div>
        <h2>Start Session</h2>
        <input
          type="text"
          placeholder="Driver ID"
          value={newSession.driver_id}
          onChange={(e) =>
            setNewSession({ ...newSession, driver_id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Conductor ID"
          value={newSession.conductor_id}
          onChange={(e) =>
            setNewSession({ ...newSession, conductor_id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Vehicle ID"
          value={newSession.vehicle_id}
          onChange={(e) =>
            setNewSession({ ...newSession, vehicle_id: e.target.value })
          }
        />
        <input
          type="datetime-local"
          value={newSession.start_time}
          onChange={(e) =>
            setNewSession({ ...newSession, start_time: e.target.value })
          }
        />
        <button onClick={handleStartSession}>Start Session</button>
      </div>

      <div>
        <h2>Live & Upcoming Sessions</h2>
        <ul>
          {sessions.map((s) => (
            <li
              key={s.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              Vehicle: {s.vehicle_id}, Driver: {s.driver_id},{" "}
              Conductor: {s.conductor_id || "N/A"}, Start: {s.start_time}
              <IconButton
                color="error"
                onClick={() => handleDeleteSession(s.id)}
                aria-label="delete"
                size="small"
                style={{ marginLeft: 8 }}
              >
                <DeleteIcon />
              </IconButton>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sessions;
