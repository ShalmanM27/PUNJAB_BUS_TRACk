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
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
} from "../api/session";
import SearchIcon from "@mui/icons-material/Search";

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
    { field: "id", headerName: "ID", width: 80, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "vehicle_id", headerName: "Vehicle ID", width: 120, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "driver_id", headerName: "Driver ID", width: 120, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "conductor_id", headerName: "Conductor ID", width: 140, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "route_name", headerName: "Route Name", width: 200, headerClassName: "super-app-theme--header" },
    { field: "start_time", headerName: "Start Time", width: 200, headerClassName: "super-app-theme--header" },
    { field: "end_time", headerName: "End Time", width: 200, headerClassName: "super-app-theme--header" },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
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
            variant="outlined"
            size="small"
            onClick={() => handleEdit(params.row)}
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
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => handleDelete(params.row.id)}
            sx={{
              minWidth: 0,
              px: 1.5,
              py: 0.5,
              bgcolor: "#fff0f0",
              color: "#d32f2f",
              fontWeight: 600,
              borderRadius: 2,
              boxShadow: "none",
              fontSize: 14,
              maxHeight: "36px",
              border: "none",
              "&:hover": { bgcolor: "#ffd6d6" }
            }}
          >
            Delete
          </Button>
        </Box>
      ),
      headerClassName: "super-app-theme--header"
    },
  ];

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
            Session Management
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
            {/* Search by Driver ID */}
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
                label="Search by Driver ID"
                variant="standard"
                size="small"
                value={searchDriverId}
                onChange={(e) => {
                  setSearchDriverId(e.target.value);
                  setSearchConductorId("");
                  setSearchVehicleId("");
                  setSearchRouteName("");
                }}
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
                  width: 100,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 }
                }}
              />
            </Box>
            {/* Search by Conductor ID */}
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
                label="Search by Conductor ID"
                variant="standard"
                size="small"
                value={searchConductorId}
                onChange={(e) => {
                  setSearchConductorId(e.target.value);
                  setSearchDriverId("");
                  setSearchVehicleId("");
                  setSearchRouteName("");
                }}
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
                  width: 120,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 }
                }}
              />
            </Box>
            {/* Search by Vehicle ID */}
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
                label="Search by Vehicle ID"
                variant="standard"
                size="small"
                value={searchVehicleId}
                onChange={(e) => {
                  setSearchVehicleId(e.target.value);
                  setSearchDriverId("");
                  setSearchConductorId("");
                  setSearchRouteName("");
                }}
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
                  width: 100,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 }
                }}
              />
            </Box>
            {/* Search by Route Name */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
                px: 1.5,
                py: 0.5,
                minWidth: 180,
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
                label="Search by Route Name"
                variant="standard"
                size="small"
                value={searchRouteName}
                onChange={(e) => {
                  setSearchRouteName(e.target.value);
                  setSearchDriverId("");
                  setSearchConductorId("");
                  setSearchVehicleId("");
                }}
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
                  minWidth: 120,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 }
                }}
              />
            </Box>
            {/* Search by Start Date */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#fff",
                borderRadius: 3,
                boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
                px: 1.5,
                py: 0.5,
                minWidth: 140,
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
                label="Start Date"
                type="date"
                variant="standard"
                size="small"
                value={searchDate}
                onChange={(e) => setSearchDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  width: 100,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 }
                }}
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
              />
            </Box>
            <Button
              variant="outlined"
              color="secondary"
              sx={{ borderRadius: 2 }}
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
          </Box>
          <Box sx={{ height: 440, mt: 2 }}>
            <DataGrid
              rows={filteredSessions}
              columns={columns}
              getRowId={(row) => row.id}
              disableRowSelectionOnClick
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
            />
          </Box>
        </CardContent>
      </Card>
      {/* Dialog Form */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#1976d2" }}>
          {editId ? "Edit Session" : "Create Session"}
        </DialogTitle>
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
          <Button onClick={() => setOpen(false)} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" color="primary" sx={{ borderRadius: 2 }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
