import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
  IconButton,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from "../api/route";

export default function Routes() {
  const [routes, setRoutes] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    route_name: "",
    source: "",
    destination: "",
    vehicle_id: "",
    route_points: [],
    estimated_time: "", // added
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");

  // Fetch routes
  const fetchRoutes = async () => {
    const data = await getRoutes();
    setRoutes(data);
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Open dialog
  const handleOpen = (route = null) => {
    if (route) {
      setForm({
        route_name: route.route_name,
        source: route.source,
        destination: route.destination,
        vehicle_id: route.vehicle_id,
        route_points: route.route_points || [],
        estimated_time: route.estimated_time || "", // added
      });
      setEditId(route.id);
    } else {
      setForm({
        route_name: "",
        source: "",
        destination: "",
        vehicle_id: "",
        route_points: [],
        estimated_time: "", // added
      });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Save
  const handleSave = async () => {
    // Ensure route_points is an array of objects with latitude and longitude
    const cleanedPoints = form.route_points
      .filter(
        (pt) =>
          pt &&
          typeof pt.latitude === "number" &&
          typeof pt.longitude === "number"
      )
      .map((pt) => ({
        latitude: pt.latitude,
        longitude: pt.longitude,
      }));
    const submitForm = { ...form, route_points: cleanedPoints, estimated_time: parseInt(form.estimated_time, 10) };
    if (editId) {
      await updateRoute(editId, submitForm);
    } else {
      await createRoute(submitForm);
    }
    fetchRoutes();
    handleClose();
  };

  // Delete
  const handleDelete = async (id) => {
    await deleteRoute(id);
    fetchRoutes();
  };

  // Route points handlers
  const handleAddPoint = () => {
    setForm((prev) => ({
      ...prev,
      route_points: [...prev.route_points, { latitude: 0, longitude: 0 }],
    }));
  };

  const handlePointChange = (idx, field, value) => {
    setForm((prev) => {
      const points = [...prev.route_points];
      points[idx][field] = parseFloat(value);
      return { ...prev, route_points: points };
    });
  };

  const handleRemovePoint = (idx) => {
    setForm((prev) => {
      const points = [...prev.route_points];
      points.splice(idx, 1);
      return { ...prev, route_points: points };
    });
  };

  // Filtered routes based on search
  const filteredRoutes = routes.filter((route) => {
    const q = search.toLowerCase();
    return (
      route.id.toString().includes(q) ||
      (route.source && route.source.toLowerCase().includes(q)) ||
      (route.destination && route.destination.toLowerCase().includes(q)) ||
      (route.vehicle_id && route.vehicle_id.toLowerCase().includes(q))
    );
  });

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "route_name", headerName: "Route Name", flex: 1 },
    { field: "source", headerName: "Source", flex: 1 },
    { field: "destination", headerName: "Destination", flex: 1 },
    { field: "vehicle_id", headerName: "Vehicle ID", flex: 1 },
    {
      field: "route_points",
      headerName: "Points",
      flex: 1,
      renderCell: (params) =>
        Array.isArray(params.row.route_points)
          ? params.row.route_points.length
          : 0,
    },
    { field: "estimated_time", headerName: "Est. Time (min)", flex: 1 }, // added
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleOpen(params.row)}>Edit</Button>
          <IconButton
            color="error"
            onClick={() => handleDelete(params.row.id)}
            aria-label="delete-route"
          >
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Route Management
      </Typography>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Route
        </Button>
        <TextField
          label="Search by Source, Destination, or Vehicle ID"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 300 }}
        />
      </div>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid
          rows={filteredRoutes}
          columns={columns}
          getRowId={(row) => row.id}
        />
      </div>

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? "Edit Route" : "Add Route"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Route Name"
            fullWidth
            value={form.route_name}
            onChange={(e) => setForm({ ...form, route_name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Source"
            fullWidth
            value={form.source}
            onChange={(e) => setForm({ ...form, source: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Destination"
            fullWidth
            value={form.destination}
            onChange={(e) => setForm({ ...form, destination: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Vehicle ID"
            fullWidth
            value={form.vehicle_id}
            onChange={(e) => setForm({ ...form, vehicle_id: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Estimated Time (minutes)"
            type="number"
            fullWidth
            value={form.estimated_time}
            onChange={(e) => setForm({ ...form, estimated_time: e.target.value })}
          />
          <Box mt={2}>
            <Typography variant="subtitle1">Route Points</Typography>
            {form.route_points.map((pt, idx) => (
              <Box
                key={idx}
                display="flex"
                alignItems="center"
                gap={1}
                mb={1}
              >
                <TextField
                  label="Latitude"
                  type="number"
                  value={pt.latitude}
                  onChange={(e) =>
                    handlePointChange(idx, "latitude", e.target.value)
                  }
                  size="small"
                />
                <TextField
                  label="Longitude"
                  type="number"
                  value={pt.longitude}
                  onChange={(e) =>
                    handlePointChange(idx, "longitude", e.target.value)
                  }
                  size="small"
                />
                <IconButton
                  color="error"
                  onClick={() => handleRemovePoint(idx)}
                  aria-label="remove-point"
                  size="small"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
            <Button
              variant="outlined"
              onClick={handleAddPoint}
              size="small"
              sx={{ mt: 1 }}
            >
              Add Point
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
