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
    source: { name: "", latitude: "", longitude: "" },
    destination: { name: "", latitude: "", longitude: "" },
    vehicle_id: "",
    estimated_time: "",
    route_points: [],
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [idSearch, setIdSearch] = useState(""); // For ID search

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      const data = await getRoutes();

      // Flatten source and destination for DataGrid
      const normalized = (data || []).map((route) => ({
        ...route,
        sourceName: route.source?.name || "",
        destinationName: route.destination?.name || "",
      }));

      setRoutes(normalized);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setRoutes([]);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Add/Remove stop handlers
  const handleAddStop = () => {
    setForm((prev) => ({
      ...prev,
      route_points: [
        ...prev.route_points,
        { name: "", latitude: "", longitude: "" },
      ],
    }));
  };
  const handleRemoveStop = (idx) => {
    setForm((prev) => ({
      ...prev,
      route_points: prev.route_points.filter((_, i) => i !== idx),
    }));
  };
  const handleStopChange = (idx, field, value) => {
    setForm((prev) => ({
      ...prev,
      route_points: prev.route_points.map((stop, i) =>
        i === idx ? { ...stop, [field]: value } : stop
      ),
    }));
  };

  // Open dialog
  const handleOpen = (route = null) => {
    if (route) {
      setForm({
        route_name: route.route_name || "",
        source: route.source
          ? {
              name: route.source?.name || "",
              latitude: route.source?.latitude?.toString() || "",
              longitude: route.source?.longitude?.toString() || "",
            }
          : { name: "", latitude: "", longitude: "" },
        destination: route.destination
          ? {
              name: route.destination?.name || "",
              latitude: route.destination?.latitude?.toString() || "",
              longitude: route.destination?.longitude?.toString() || "",
            }
          : { name: "", latitude: "", longitude: "" },
        vehicle_id: route.vehicle_id || "",
        estimated_time: route.estimated_time ?? "",
        route_points: route.route_points
          ? route.route_points.map((pt) => ({
              name: pt.name || "",
              latitude: pt.latitude?.toString() || "",
              longitude: pt.longitude?.toString() || "",
            }))
          : [],
      });
      setEditId(route.id);
    } else {
      setForm({
        route_name: "",
        source: { name: "", latitude: "", longitude: "" },
        destination: { name: "", latitude: "", longitude: "" },
        vehicle_id: "",
        estimated_time: "",
        route_points: [],
      });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Save
  const handleSave = async () => {
    try {
      const estimated_time = form.estimated_time
        ? parseInt(form.estimated_time, 10)
        : 0;

      const source =
        form.source &&
        form.source.name &&
        form.source.latitude !== "" &&
        form.source.longitude !== "" &&
        !isNaN(Number(form.source.latitude)) &&
        !isNaN(Number(form.source.longitude))
          ? {
              name: form.source.name,
              latitude: parseFloat(form.source.latitude),
              longitude: parseFloat(form.source.longitude),
            }
          : null;

      const destination =
        form.destination &&
        form.destination.name &&
        form.destination.latitude !== "" &&
        form.destination.longitude !== "" &&
        !isNaN(Number(form.destination.latitude)) &&
        !isNaN(Number(form.destination.longitude))
          ? {
              name: form.destination.name,
              latitude: parseFloat(form.destination.latitude),
              longitude: parseFloat(form.destination.longitude),
            }
          : null;

      const route_points = (form.route_points || [])
        .filter(
          (pt) =>
            pt.name &&
            pt.latitude !== "" &&
            pt.longitude !== "" &&
            !isNaN(Number(pt.latitude)) &&
            !isNaN(Number(pt.longitude))
        )
        .map((pt) => ({
          name: pt.name,
          latitude: parseFloat(pt.latitude),
          longitude: parseFloat(pt.longitude),
        }));

      const submitForm = {
        route_name: form.route_name,
        source,
        destination,
        vehicle_id: form.vehicle_id,
        estimated_time,
        route_points,
      };

      if (!source || !destination) {
        alert("Please fill valid source and destination with coordinates.");
        return;
      }

      if (editId) {
        await updateRoute(editId, submitForm);
      } else {
        await createRoute(submitForm);
      }
      await fetchRoutes();
      handleClose();
    } catch (err) {
      console.error("Failed to save route:", err);
    }
  };

  // Delete
  const handleDelete = async (id) => {
    try {
      await deleteRoute(id);
      await fetchRoutes();
    } catch (err) {
      console.error("Failed to delete route:", err);
    }
  };

  // Filtered routes
  const filteredRoutes = routes.filter((route) => {
    const idQ = idSearch.trim();
    const q = search.toLowerCase();
    if (idQ) {
      return route.id.toString().includes(idQ);
    }
    return (
      (route.route_name && route.route_name.toLowerCase().includes(q)) ||
      (route.source?.name?.toLowerCase().includes(q)) ||
      (route.destination?.name?.toLowerCase().includes(q)) ||
      (route.vehicle_id &&
        route.vehicle_id.toString().toLowerCase().includes(q))
    );
  });

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "route_name", headerName: "Route Name", flex: 1 },
    { field: "sourceName", headerName: "Source", flex: 1 },
    { field: "destinationName", headerName: "Destination", flex: 1 },
    { field: "vehicle_id", headerName: "Vehicle ID", flex: 1 },
    { field: "estimated_time", headerName: "Est. Time (min)", flex: 1 },
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
          label="Search by ID"
          variant="outlined"
          size="small"
          value={idSearch}
          onChange={(e) => setIdSearch(e.target.value)}
          style={{ width: 100 }}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
        />
        <TextField
          label="Search by Route Name, Source, Destination, or Vehicle ID"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 300 }}
          disabled={!!idSearch}
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
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Source
          </Typography>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextField
              label="Source Name"
              size="small"
              value={form.source.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  source: { ...prev.source, name: e.target.value },
                }))
              }
              style={{ flex: 2 }}
            />
            <TextField
              label="Latitude"
              size="small"
              value={form.source.latitude}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  source: { ...prev.source, latitude: e.target.value },
                }))
              }
              style={{ flex: 1 }}
              type="number"
            />
            <TextField
              label="Longitude"
              size="small"
              value={form.source.longitude}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  source: { ...prev.source, longitude: e.target.value },
                }))
              }
              style={{ flex: 1 }}
              type="number"
            />
          </div>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Destination
          </Typography>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <TextField
              label="Destination Name"
              size="small"
              value={form.destination.name}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  destination: { ...prev.destination, name: e.target.value },
                }))
              }
              style={{ flex: 2 }}
            />
            <TextField
              label="Latitude"
              size="small"
              value={form.destination.latitude}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  destination: {
                    ...prev.destination,
                    latitude: e.target.value,
                  },
                }))
              }
              style={{ flex: 1 }}
              type="number"
            />
            <TextField
              label="Longitude"
              size="small"
              value={form.destination.longitude}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  destination: {
                    ...prev.destination,
                    longitude: e.target.value,
                  },
                }))
              }
              style={{ flex: 1 }}
              type="number"
            />
          </div>
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
            onChange={(e) =>
              setForm({ ...form, estimated_time: e.target.value })
            }
          />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Intermediate Bus Stops
          </Typography>
          {form.route_points.map((stop, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <TextField
                label="Stop Name"
                size="small"
                value={stop.name}
                onChange={(e) => handleStopChange(idx, "name", e.target.value)}
                style={{ flex: 2 }}
              />
              <TextField
                label="Latitude"
                size="small"
                value={stop.latitude}
                onChange={(e) =>
                  handleStopChange(idx, "latitude", e.target.value)
                }
                style={{ flex: 1 }}
                type="number"
              />
              <TextField
                label="Longitude"
                size="small"
                value={stop.longitude}
                onChange={(e) =>
                  handleStopChange(idx, "longitude", e.target.value)
                }
                style={{ flex: 1 }}
                type="number"
              />
              <Button
                color="error"
                onClick={() => handleRemoveStop(idx)}
                size="small"
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outlined"
            onClick={handleAddStop}
            sx={{ mt: 1, mb: 2 }}
            size="small"
          >
            Add Stop
          </Button>
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
