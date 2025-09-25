// src/pages/Vehicles.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../api/vehicle";
import { getSessions } from "../api/session";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [vehicleData, setVehicleData] = useState({
    registration_number: "",
    capacity: 0,
  });
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState(""); // For registration number, capacity
  const [idSearch, setIdSearch] = useState(""); // For ID search

  const fetchVehicles = async () => {
    const [vehicleData, sessions] = await Promise.all([
      getVehicles(),
      getSessions(),
    ]);

    const now = new Date();

    // Build map of upcoming sessions by vehicle_id
    const upcomingMap = {};
    sessions.forEach((s) => {
      const start = new Date(s.start_time);
      if (start >= now) {
        if (
          !upcomingMap[s.vehicle_id] ||
          new Date(upcomingMap[s.vehicle_id].start_time) > start
        ) {
          upcomingMap[s.vehicle_id] = s;
        }
      }
    });

    // Enrich vehicles with upcoming driver & conductor IDs
    const enriched = vehicleData.map((v) => {
      const session = upcomingMap[v.id];
      return {
        ...v,
        current_driver_id: session ? session.driver_id : "-",
        current_conductor_id: session ? session.conductor_id || "-" : "-",
      };
    });

    setVehicles(enriched);
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpen = (vehicle = null) => {
    if (vehicle) {
      setVehicleData(vehicle);
      setEditingId(vehicle.id);
    } else {
      setVehicleData({ registration_number: "", capacity: 0 });
      setEditingId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (editingId) {
      await updateVehicle(editingId, vehicleData);
    } else {
      await createVehicle(vehicleData);
    }
    handleClose();
    fetchVehicles();
  };

  const handleDelete = async (id) => {
    await deleteVehicle(id);
    fetchVehicles();
  };

  // Filtered vehicles based on idSearch and search
  const filteredVehicles = vehicles.filter((vehicle) => {
    const idQ = idSearch.trim();
    const q = search.toLowerCase();
    if (idQ) {
      return vehicle.id.toString().includes(idQ);
    }
    return (
      (vehicle.registration_number &&
        vehicle.registration_number.toLowerCase().includes(q)) ||
      (vehicle.capacity && vehicle.capacity.toString().includes(q))
    );
  });

  const columns = [
    { field: "id", headerName: "ID", width: 80, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    { field: "registration_number", headerName: "Registration", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "capacity", headerName: "Capacity", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "current_driver_id", headerName: "Driver ID", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "current_conductor_id", headerName: "Conductor ID", flex: 1, headerClassName: "super-app-theme--header" },
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
            aria-label="delete-vehicle"
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#1976d2" }}>
            Vehicle Management
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
              color="primary"
              sx={{
                fontWeight: 600,
                borderRadius: 2,
                px: 3,
                bgcolor: "#1976d2",
                color: "#fff",
                boxShadow: "0 2px 8px rgba(25,118,210,0.15)",
                "&:hover": { bgcolor: "#125ea2" },
              }}
              onClick={() => handleOpen()}
            >
              Add Vehicle
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
            {/* Search by Registration/Capacity */}
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
                label="Search by Registration or Capacity"
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
              rows={filteredVehicles}
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
      <Dialog open={open} onClose={handleClose} PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 700, color: "#1976d2" }}>
          {editingId ? "Edit Vehicle" : "Add Vehicle"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Registration Number"
            type="text"
            fullWidth
            value={vehicleData.registration_number}
            onChange={(e) =>
              setVehicleData({
                ...vehicleData,
                registration_number: e.target.value,
              })
            }
          />
          <TextField
            margin="dense"
            label="Capacity"
            type="number"
            fullWidth
            value={
              vehicleData.capacity === 0
                ? ""
                : vehicleData.capacity === undefined
                ? ""
                : vehicleData.capacity
            }
            onChange={(e) => {
              const val = e.target.value;
              setVehicleData({
                ...vehicleData,
                capacity: val === "" ? "" : Number(val),
              });
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button onClick={handleSave} color="primary" variant="contained" sx={{ borderRadius: 2 }}>
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
