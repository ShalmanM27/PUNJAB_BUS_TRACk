import React, { useEffect, useState } from "react";
import {
  getAssignments,
  createAssignment,
  assignDriverToVehicle,
  assignConductorToVehicle,
} from "../api/assignment";

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [newAssignment, setNewAssignment] = useState({
    vehicle_id: "",
    driver_id: "",
    route_id: "",
    timestamp: "",
  });

  const fetchAssignments = async () => {
    const data = await getAssignments();
    setAssignments(data);
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleCreateAssignment = async () => {
    try {
      await createAssignment(newAssignment);
      fetchAssignments();
      alert("Assignment created successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to create assignment.");
    }
  };

  return (
    <div>
      <h1>Assignments</h1>

      <div>
        <h2>Create Assignment</h2>
        <input
          type="text"
          placeholder="Vehicle ID"
          value={newAssignment.vehicle_id}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, vehicle_id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Driver ID"
          value={newAssignment.driver_id}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, driver_id: e.target.value })
          }
        />
        <input
          type="text"
          placeholder="Route ID"
          value={newAssignment.route_id}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, route_id: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Timestamp"
          value={newAssignment.timestamp}
          onChange={(e) =>
            setNewAssignment({ ...newAssignment, timestamp: parseInt(e.target.value) })
          }
        />
        <button onClick={handleCreateAssignment}>Create Assignment</button>
      </div>

      <div>
        <h2>All Assignments</h2>
        <ul>
          {assignments.map((a) => (
            <li key={a.id}>
              Vehicle: {a.vehicle_id}, Driver: {a.driver_id}, Route: {a.route_id}, Timestamp: {a.timestamp}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Assignments;
