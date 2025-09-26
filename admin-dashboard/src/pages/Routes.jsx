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
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import RoomIcon from "@mui/icons-material/Room";
import {
  getRoutes,
  createRoute,
  updateRoute,
  deleteRoute,
} from "../api/route";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix marker icon for leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// MapPickerDialog component
function MapPickerDialog({ open, onClose, onPick, initialPosition }) {
  const [position, setPosition] = useState(initialPosition || [31.1471, 75.3412]); // Punjab default

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return <Marker position={position} />;
  }

  useEffect(() => {
    if (initialPosition) setPosition(initialPosition);
  }, [initialPosition, open]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Pick Location on Map</DialogTitle>
      <DialogContent>
        <div style={{ height: 400, width: "100%" }}>
          <MapContainer
            center={position}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            <LocationMarker />
          </MapContainer>
        </div>
        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end", gap: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              onPick(position);
              onClose();
            }}
          >
            Select
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

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

  // Map picker state
  const [mapPicker, setMapPicker] = useState({
    open: false,
    target: null, // "source" | "destination" | { type: "stop", idx: number }
    initial: null,
  });

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
    { field: "id", headerName: "ID", width: 80, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "route_name", headerName: "Route Name", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "sourceName", headerName: "Source", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "destinationName", headerName: "Destination", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "vehicle_id", headerName: "Vehicle ID", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "estimated_time", headerName: "Est. Time (min)", flex: 1, headerClassName: "super-app-theme--header" },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center", align: "center",
      renderCell: (params) => (
        <Box sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          gap: 1,
          height: "100%",
          overflow: "hidden"
        }}>
          <Button
            onClick={() => handleOpen(params.row)}
            size="small"
            sx={{
              minWidth: 0,
              px: 1.5,
              py: 0.5,
              bgcolor: "#e3eafc",
              color: "#1976d2",
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "none",
              fontSize: 14,
              maxHeight: "36px",
              "&:hover": { bgcolor: "#bbd2fa" }
            }}
          >
            Edit
          </Button>
          <IconButton
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
            aria-label="delete-route"
            sx={{
              bgcolor: "#fff0f0",
              borderRadius: 2,
              fontSize: 18,
              p: 0.5,
              maxHeight: "36px",
              "&:hover": { bgcolor: "#ffd6d6" }
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
      headerClassName: "super-app-theme--header"
    },
  ];

  // Map picker handlers
  const openMapPicker = (target, initial) => {
    setMapPicker({ open: true, target, initial });
  };
  const closeMapPicker = () => setMapPicker((prev) => ({ ...prev, open: false }));

  const handleMapPick = (latlng) => {
    const [lat, lng] = latlng;
    if (mapPicker.target === "source") {
      setForm((prev) => ({
        ...prev,
        source: { ...prev.source, latitude: lat.toString(), longitude: lng.toString() },
      }));
    } else if (mapPicker.target === "destination") {
      setForm((prev) => ({
        ...prev,
        destination: { ...prev.destination, latitude: lat.toString(), longitude: lng.toString() },
      }));
    } else if (mapPicker.target && mapPicker.target.type === "stop") {
      setForm((prev) => ({
        ...prev,
        route_points: prev.route_points.map((stop, i) =>
          i === mapPicker.target.idx
            ? { ...stop, latitude: lat.toString(), longitude: lng.toString() }
            : stop
        ),
      }));
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, bgcolor: "#eaf3fb", minHeight: "100vh" }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(25,118,210,0.10)",
          background: "linear-gradient(135deg, #eaf3fb 60%, #d0e6ff 100%)"
        }}
      >
        <CardContent>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#1565c0" }}>
            Route Management
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Button
              variant="contained"
              sx={{
                bgcolor: "#1976d2",
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                color: "#fff",
                boxShadow: "0 2px 8px rgba(25,118,210,0.15)",
                "&:hover": { bgcolor: "#125ea2" },
              }}
              onClick={() => handleOpen()}
            >
              Add Route
            </Button>
            {/* Search by ID */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
                px: 1.5,
                py: 0.5,
                minWidth: 120,
                border: "2px solid #1976d2",
                transition: "box-shadow 0.2s, border 0.2s",
                "&:focus-within": {
                  border: "2.5px solid #1565c0",
                  boxShadow: "0 4px 16px rgba(25,118,210,0.18)"
                }
              }}
            >
              <SearchIcon sx={{ color: "#1976d2", mr: 1, fontSize: 22 }} />
              <TextField
                label="Search by ID"
                variant="standard"
                size="small"
                value={idSearch}
                onChange={(e) => setIdSearch(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: 16,
                    bgcolor: "transparent",
                    borderRadius: 2,
                    px: 0,
                    color: "#1976d2"
                  }
                }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                sx={{
                  width: 80,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 }
                }}
              />
            </Box>
            {/* Search by Route Name, Source, Destination, or Vehicle ID */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
                px: 1.5,
                py: 0.5,
                minWidth: 320,
                border: "2px solid #1976d2",
                transition: "box-shadow 0.2s, border 0.2s",
                "&:focus-within": {
                  border: "2.5px solid #1565c0",
                  boxShadow: "0 4px 16px rgba(25,118,210,0.18)"
                }
              }}
            >
              <SearchIcon sx={{ color: "#1976d2", mr: 1, fontSize: 22 }} />
              <TextField
                label="Search by Route Name, Source, Destination, or Vehicle ID"
                variant="standard"
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                disabled={!!idSearch}
                InputProps={{
                  disableUnderline: true,
                  sx: {
                    fontSize: 16,
                    bgcolor: "transparent",
                    borderRadius: 2,
                    px: 0,
                    color: "#1976d2"
                  }
                }}
                sx={{
                  minWidth: 220,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 }
                }}
              />
            </Box>
          </Box>
          <Box sx={{ height: 440, mt: 2 }}>
            <DataGrid
              rows={filteredRoutes}
              columns={columns}
              getRowId={(row) => row.id}
              sx={{
                borderRadius: 4,
                bgcolor: "#f5faff",
                boxShadow: "0 8px 32px rgba(25,118,210,0.13)",
                fontFamily: "inherit",
                "& .MuiDataGrid-row": {
                  display: "flex",
                  alignItems: "center",
                  bgcolor: "#fff",
                  borderLeft: "6px solid #1976d2",
                  boxShadow: "0 4px 18px rgba(25,118,210,0.07)",
                  borderRadius: 3,
                  margin: "12px 0",
                  minHeight: 72,
                  maxHeight: 72,
                  height: 72,
                  transition: "transform 0.18s, box-shadow 0.18s, background 0.18s",
                  overflow: "hidden",
                  "&:nth-of-type(even)": {
                    bgcolor: "#e3eafc"
                  },
                  "&:hover": {
                    transform: "scale(1.012)",
                    boxShadow: "0 10px 32px 0 rgba(25,118,210,0.16)",
                    borderLeft: "6px solid #1565c0",
                    bgcolor: "#eaf3fb"
                  }
                },
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 17,
                  py: 0,
                  px: 2,
                  borderBottom: "none",
                  height: "100%",
                  maxHeight: "72px",
                  overflow: "hidden"
                },
                "& .MuiDataGrid-columnHeaders": {
                  bgcolor: "linear-gradient(90deg, #1976d2 0%, #63a4ff 100%)",
                  background: "linear-gradient(90deg, #1976d2 0%, #63a4ff 100%)",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 19,
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                  minHeight: 64,
                  maxHeight: 64
                },
                "& .super-app-theme--header": {
                  bgcolor: "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 19,
                  letterSpacing: 1
                },
                "& .MuiDataGrid-footerContainer": {
                  bgcolor: "#e3eafc",
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16
                },
                "& .MuiDataGrid-virtualScroller": {
                  bgcolor: "transparent"
                },
                "& .MuiDataGrid-columnSeparator": {
                  display: "none"
                },
                "& .MuiDataGrid-root": {
                  border: "none"
                }
              }}
              rowHeight={72}
              headerHeight={64}
              hideFooterSelectedRowCount
              disableColumnMenu
              disableColumnSelector
              disableDensitySelector
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>
      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#1976d2" }}>
          {editId ? "Edit Route" : "Add Route"}
        </DialogTitle>
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
          <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
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
              sx={{ flex: 2 }}
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
              sx={{ flex: 1 }}
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
              sx={{ flex: 1 }}
              type="number"
            />
            <IconButton
              color="primary"
              onClick={() =>
                openMapPicker(
                  "source",
                  form.source.latitude && form.source.longitude
                    ? [parseFloat(form.source.latitude), parseFloat(form.source.longitude)]
                    : undefined
                )
              }
              sx={{ ml: 1 }}
              title="Pick on Map"
            >
              <RoomIcon />
            </IconButton>
          </Box>
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Destination
          </Typography>
          <Box sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
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
              sx={{ flex: 2 }}
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
              sx={{ flex: 1 }}
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
              sx={{ flex: 1 }}
              type="number"
            />
            <IconButton
              color="primary"
              onClick={() =>
                openMapPicker(
                  "destination",
                  form.destination.latitude && form.destination.longitude
                    ? [parseFloat(form.destination.latitude), parseFloat(form.destination.longitude)]
                    : undefined
                )
              }
              sx={{ ml: 1 }}
              title="Pick on Map"
            >
              <RoomIcon />
            </IconButton>
          </Box>
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
            <Box
              key={idx}
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                mb: 1,
              }}
            >
              <TextField
                label="Stop Name"
                size="small"
                value={stop.name}
                onChange={(e) => handleStopChange(idx, "name", e.target.value)}
                sx={{ flex: 2 }}
              />
              <TextField
                label="Latitude"
                size="small"
                value={stop.latitude}
                onChange={(e) =>
                  handleStopChange(idx, "latitude", e.target.value)
                }
                sx={{ flex: 1 }}
                type="number"
              />
              <TextField
                label="Longitude"
                size="small"
                value={stop.longitude}
                onChange={(e) =>
                  handleStopChange(idx, "longitude", e.target.value)
                }
                sx={{ flex: 1 }}
                type="number"
              />
              <IconButton
                color="primary"
                onClick={() =>
                  openMapPicker(
                    { type: "stop", idx },
                    stop.latitude && stop.longitude
                      ? [parseFloat(stop.latitude), parseFloat(stop.longitude)]
                      : undefined
                  )
                }
                sx={{ ml: 1 }}
                title="Pick on Map"
              >
                <RoomIcon />
              </IconButton>
              <Button
                color="error"
                onClick={() => handleRemoveStop(idx)}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Remove
              </Button>
            </Box>
          ))}
          <Button
            variant="outlined"
            onClick={handleAddStop}
            sx={{ mt: 1, mb: 2, borderRadius: 2 }}
            size="small"
          >
            Add Stop
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" sx={{ borderRadius: 2 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
      {/* Map Picker Dialog */}
      <MapPickerDialog
        open={mapPicker.open}
        onClose={closeMapPicker}
        onPick={handleMapPick}
        initialPosition={mapPicker.initial}
      />
    </Box>
  );
}