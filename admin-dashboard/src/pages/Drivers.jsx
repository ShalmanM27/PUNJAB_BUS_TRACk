// src/pages/Drivers.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../api/driver";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    license_number: "",
    assigned_vehicle_id: "",
  });
  const [editId, setEditId] = useState(null);

  // Fetch drivers
  const fetchDrivers = async () => {
    const data = await getDrivers();
    setDrivers(data);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  // Open dialog
  const handleOpen = (driver = null) => {
    if (driver) {
      setForm({
        name: driver.name,
        phone: driver.phone,
        license_number: driver.license_number,
        assigned_vehicle_id: driver.assigned_vehicle_id || "",
      });
      setEditId(driver.id);
    } else {
      setForm({ name: "", phone: "", license_number: "", assigned_vehicle_id: "" });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Save
  const handleSave = async () => {
    if (editId) {
      await updateDriver(editId, form);
    } else {
      await createDriver(form);
    }
    fetchDrivers();
    handleClose();
  };

  // Delete
  const handleDelete = async (id) => {
    await deleteDriver(id);
    fetchDrivers();
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "license_number", headerName: "License No.", flex: 1 },
    { field: "assigned_vehicle_id", headerName: "Assigned Vehicle", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button onClick={() => handleOpen(params.row)}>Edit</Button>
          <Button color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Driver Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpen()}>
        Add Driver
      </Button>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid rows={drivers} columns={columns} getRowId={(row) => row.id} />
      </div>

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "Edit Driver" : "Add Driver"}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Name"
            fullWidth
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Phone"
            fullWidth
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <TextField
            margin="dense"
            label="License Number"
            fullWidth
            value={form.license_number}
            onChange={(e) =>
              setForm({ ...form, license_number: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Assigned Vehicle ID"
            fullWidth
            value={form.assigned_vehicle_id}
            onChange={(e) =>
              setForm({ ...form, assigned_vehicle_id: e.target.value })
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
