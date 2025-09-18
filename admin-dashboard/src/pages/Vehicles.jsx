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
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from "../api/vehicle";
import { getUpcomingSessionForVehicle } from "../api/session";
import DeleteIcon from "@mui/icons-material/Delete";

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
    const data = await getVehicles();

    // Attach driver_id & conductor_id from upcoming session
    const enrichedVehicles = await Promise.all(
      data.map(async (vehicle) => {
        try {
          const session = await getUpcomingSessionForVehicle(vehicle.id);
          return {
            ...vehicle,
            current_driver_id: session.driver_id,
            current_conductor_id: session.conductor_id || "-",
          };
        } catch (err) {
          // No upcoming session -> keep them empty
          return {
            ...vehicle,
            current_driver_id: "-",
            current_conductor_id: "-",
          };
        }
      })
    );

    setVehicles(enrichedVehicles);
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
    { field: "id", headerName: "ID", width: 80 },
    { field: "registration_number", headerName: "Registration", flex: 1 },
    { field: "capacity", headerName: "Capacity", flex: 1 },
    { field: "current_driver_id", headerName: "Driver ID", flex: 1 },
    { field: "current_conductor_id", headerName: "Conductor ID", flex: 1 },
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
            aria-label="delete-vehicle"
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
        Vehicle Management
      </Typography>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => handleOpen()}
        >
          Add Vehicle
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
          label="Search by Registration or Capacity"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 250 }}
          disabled={!!idSearch}
        />
      </div>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid
          rows={filteredVehicles}
          columns={columns}
          getRowId={(row) => row.id}
        />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editingId ? "Edit Vehicle" : "Add Vehicle"}</DialogTitle>
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
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} color="primary">
            {editingId ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
