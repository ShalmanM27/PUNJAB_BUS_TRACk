// src/pages/Vehicles.jsx
import React, { useEffect, useState } from "react";
import { Button, Typography, TextField, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getVehicles, createVehicle, updateVehicle, deleteVehicle, assignDriver, assignConductor } from "../api/vehicle";

export default function Vehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [open, setOpen] = useState(false);
  const [vehicleData, setVehicleData] = useState({ registration_number: "", capacity: 0 });
  const [editingId, setEditingId] = useState(null);

  const fetchVehicles = async () => {
    const data = await getVehicles();
    setVehicles(data);
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
          <Button color="error" onClick={() => handleDelete(params.row.id)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Vehicle Management
      </Typography>
      <Button variant="contained" color="primary" onClick={() => handleOpen()}>
        Add Vehicle
      </Button>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid rows={vehicles} columns={columns} getRowId={(row) => row.id} />
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
            onChange={(e) => setVehicleData({ ...vehicleData, registration_number: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Capacity"
            type="number"
            fullWidth
            value={vehicleData.capacity}
            onChange={(e) => setVehicleData({ ...vehicleData, capacity: parseInt(e.target.value) })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSave} color="primary">{editingId ? "Update" : "Add"}</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
