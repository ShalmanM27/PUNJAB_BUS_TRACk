import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from "../api/session";

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    driver_id: "",
    conductor_id: "",
    vehicle_id: "",
    route_id: "", // ✅ added
    start_time: "",
  });
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);
  const [searchDriverId, setSearchDriverId] = useState("");
  const [searchConductorId, setSearchConductorId] = useState("");
  const [searchVehicleId, setSearchVehicleId] = useState("");
  const [searchRouteName, setSearchRouteName] = useState("");
  const [searchDate, setSearchDate] = useState("");

  const fetchSessions = async () => {
    try {
      const data = await getSessions();
      setSessions(data);
    } catch (err) {
      console.error("Failed to fetch sessions:", err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setError("");
      if (editId) {
        await updateSession(editId, formData);
      } else {
        await createSession(formData);
      }
      setOpen(false);
      setFormData({
        driver_id: "",
        conductor_id: "",
        vehicle_id: "",
        route_id: "", // reset
        start_time: "",
      });
      setEditId(null);
      fetchSessions();
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to save session");
    }
  };

  const handleEdit = (row) => {
    setFormData({
      driver_id: row.driver_id,
      conductor_id: row.conductor_id || "",
      vehicle_id: row.vehicle_id,
      route_id: row.route_id || "", // ✅ keep track for editing
      start_time: row.start_time?.slice(0, 16), // format for datetime-local
    });
    setEditId(row.id);
    setOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      await deleteSession(id);
      fetchSessions();
    }
  };

  // Filtering logic
  const filteredSessions = sessions.filter((session) => {
    // Only one of the four search bars should be active at a time
    const driverQ = searchDriverId.trim();
    const conductorQ = searchConductorId.trim();
    const vehicleQ = searchVehicleId.trim();
    const routeQ = searchRouteName.trim().toLowerCase();
    const dateQ = searchDate.trim();

    // Helper: check if session's start_time is on or after the selected date
    const matchesDate = (startTime) => {
      if (!dateQ) return true;
      // start_time is ISO string, dateQ is yyyy-MM-dd
      return startTime.slice(0, 10) >= dateQ;
    };

    if (driverQ) {
      return (
        session.driver_id?.toString().includes(driverQ) &&
        matchesDate(session.start_time)
      );
    }
    if (conductorQ) {
      return (
        session.conductor_id?.toString().includes(conductorQ) &&
        matchesDate(session.start_time)
      );
    }
    if (vehicleQ) {
      return (
        session.vehicle_id?.toString().includes(vehicleQ) &&
        matchesDate(session.start_time)
      );
    }
    if (routeQ) {
      return (
        (session.route_name || "").toLowerCase().includes(routeQ) &&
        matchesDate(session.start_time)
      );
    }
    // If no search, but date is selected, show all sessions from that date
    if (dateQ) {
      return matchesDate(session.start_time);
    }
    // Default: show all
    return true;
  });

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "vehicle_id", headerName: "Vehicle ID", width: 120 },
    { field: "driver_id", headerName: "Driver ID", width: 120 },
    { field: "conductor_id", headerName: "Conductor ID", width: 140 },
    { field: "route_name", headerName: "Route Name", width: 200 }, // ✅ backend resolves route_id -> route_name
    { field: "start_time", headerName: "Start Time", width: 200 },
    { field: "end_time", headerName: "End Time", width: 200 },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      renderCell: (params) => (
        <>
          <Button
            variant="outlined"
            size="small"
            onClick={() => handleEdit(params.row)}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Typography variant="h5" gutterBottom>
        Session Management
      </Typography>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setFormData({
              driver_id: "",
              conductor_id: "",
              vehicle_id: "",
              route_id: "",
              start_time: "",
            });
            setEditId(null);
            setOpen(true);
          }}
        >
          Add Session
        </Button>
        <TextField
          label="Search by Driver ID"
          variant="outlined"
          size="small"
          value={searchDriverId}
          onChange={(e) => {
            setSearchDriverId(e.target.value);
            setSearchConductorId("");
            setSearchVehicleId("");
            setSearchRouteName("");
          }}
          style={{ width: 140 }}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <TextField
          label="Search by Conductor ID"
          variant="outlined"
          size="small"
          value={searchConductorId}
          onChange={(e) => {
            setSearchConductorId(e.target.value);
            setSearchDriverId("");
            setSearchVehicleId("");
            setSearchRouteName("");
          }}
          style={{ width: 160 }}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <TextField
          label="Search by Vehicle ID"
          variant="outlined"
          size="small"
          value={searchVehicleId}
          onChange={(e) => {
            setSearchVehicleId(e.target.value);
            setSearchDriverId("");
            setSearchConductorId("");
            setSearchRouteName("");
          }}
          style={{ width: 140 }}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <TextField
          label="Search by Route Name"
          variant="outlined"
          size="small"
          value={searchRouteName}
          onChange={(e) => {
            setSearchRouteName(e.target.value);
            setSearchDriverId("");
            setSearchConductorId("");
            setSearchVehicleId("");
          }}
          style={{ width: 180 }}
        />
        <TextField
          label="Start Date"
          type="date"
          variant="outlined"
          size="small"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          style={{ width: 140 }}
        />
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => {
            setSearchDriverId("");
            setSearchConductorId("");
            setSearchVehicleId("");
            setSearchRouteName("");
            setSearchDate("");
          }}
        >
          Clear Filters
        </Button>
      </div>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid
          rows={filteredSessions}
          columns={columns}
          getRowId={(row) => row.id}
          disableRowSelectionOnClick
        />
      </div>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{editId ? "Edit Session" : "Create Session"}</DialogTitle>
        <DialogContent>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            margin="dense"
            label="Driver ID"
            name="driver_id"
            fullWidth
            value={formData.driver_id}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Conductor ID"
            name="conductor_id"
            fullWidth
            value={formData.conductor_id}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Vehicle ID"
            name="vehicle_id"
            fullWidth
            value={formData.vehicle_id}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Route ID"
            name="route_id"
            fullWidth
            value={formData.route_id}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Start Time"
            name="start_time"
            type="datetime-local"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.start_time}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
