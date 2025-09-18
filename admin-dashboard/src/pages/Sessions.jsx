import React, { useEffect, useState } from "react";
import { getSessions, startSession, endSession } from "../api/session";

const Sessions = () => {
  const [sessions, setSessions] = useState([]);
  const [newSession, setNewSession] = useState({
    driver_id: "",
    conductor_id: "",
    vehicle_id: "",
    start_time: new Date().toISOString(),
  });

  const fetchSessions = async () => {
    const data = await getSessions();
    setSessions(data);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStartSession = async () => {
    try {
      await startSession(newSession);
      fetchSessions();
      alert("Session started successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to start session.");
    }
  };

  const handleEndSession = async (sessionId) => {
    try {
      await endSession(sessionId);
      fetchSessions();
      alert("Session ended successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to end session.");
    }
  };

  return (
    <div>
      <h1>Sessions</h1>

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
        <h2>All Sessions</h2>
        <ul>
          {sessions.map((s) => (
            <li key={s.id}>
              Vehicle: {s.vehicle_id}, Driver: {s.driver_id}, Conductor: {s.conductor_id}, 
              Start: {s.start_time}, End: {s.end_time || "Ongoing"}{" "}
              { !s.end_time && <button onClick={() => handleEndSession(s.id)}>End Session</button> }
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sessions;
