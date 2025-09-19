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
    source: "",
    destination: "",
    vehicle_id: "",
    estimated_time: "",
  });
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [idSearch, setIdSearch] = useState(""); // For ID search

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      const data = await getRoutes();
      setRoutes(data || []);
    } catch (err) {
      console.error("Failed to fetch routes:", err);
      setRoutes([]);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  // Open dialog
  const handleOpen = (route = null) => {
    if (route) {
      setForm({
        route_name: route.route_name || "",
        source: route.source || "",
        destination: route.destination || "",
        vehicle_id: route.vehicle_id || "",
        estimated_time: route.estimated_time ?? "",
      });
      setEditId(route.id);
    } else {
      setForm({
        route_name: "",
        source: "",
        destination: "",
        vehicle_id: "",
        estimated_time: "",
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

      const submitForm = {
        route_name: form.route_name,
        source: form.source,
        destination: form.destination,
        vehicle_id: form.vehicle_id,
        estimated_time,
      };

      if (editId) {
        await updateRoute(editId, submitForm);
      } else {
        await createRoute(submitForm);
      }
      await fetchRoutes();
      handleClose();
    } catch (err) {
      console.error("Failed to save route:", err);
      // optionally show notification to user
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

  // Filtered routes based on idSearch and search
  const filteredRoutes = routes.filter((route) => {
    const idQ = idSearch.trim();
    const q = search.toLowerCase();
    if (idQ) {
      return route.id.toString().includes(idQ);
    }
    return (
      (route.route_name && route.route_name.toLowerCase().includes(q)) ||
      (route.source && route.source.toLowerCase().includes(q)) ||
      (route.destination && route.destination.toLowerCase().includes(q)) ||
      (route.vehicle_id &&
        route.vehicle_id.toString().toLowerCase().includes(q))
    );
  });

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    { field: "route_name", headerName: "Route Name", flex: 1 },
    { field: "source", headerName: "Source", flex: 1 },
    { field: "destination", headerName: "Destination", flex: 1 },
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
        <DataGrid rows={filteredRoutes} columns={columns} getRowId={(row) => row.id} />
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
            onChange={(e) =>
              setForm({ ...form, estimated_time: e.target.value })
            }
          />
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
