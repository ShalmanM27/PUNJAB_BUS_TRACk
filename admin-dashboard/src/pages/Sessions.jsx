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
    start_time: "",
  });
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

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

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "vehicle_id", headerName: "Vehicle ID", width: 120 },
    { field: "driver_id", headerName: "Driver ID", width: 120 },
    { field: "conductor_id", headerName: "Conductor ID", width: 140 },
    { field: "route_id", headerName: "Route ID", width: 120 },
    { field: "start_time", headerName: "Start Time", width: 200 },
    { field: "end_time", headerName: "End Time", width: 200 }, // <-- NEW COLUMN
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
      <Button
        variant="contained"
        color="primary"
        onClick={() => {
          setFormData({
            driver_id: "",
            conductor_id: "",
            vehicle_id: "",
            start_time: "",
          });
          setEditId(null);
          setOpen(true);
        }}
      >
        Add Session
      </Button>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid
          rows={sessions}
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
