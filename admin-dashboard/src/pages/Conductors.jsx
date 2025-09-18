// src/pages/Conductors.jsx
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
  getConductors,
  createConductor,
  updateConductor,
  deleteConductor,
} from "../api/conductor";

export default function Conductors() {
  const [conductors, setConductors] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    employee_id: "",
    route_id: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchConductors = async () => {
    const data = await getConductors();
    setConductors(data);
  };

  useEffect(() => {
    fetchConductors();
  }, []);

  const handleOpen = (conductor = null) => {
    if (conductor) {
      setForm({
        name: conductor.name,
        phone: conductor.phone,
        employee_id: conductor.employee_id,
        route_id: conductor.route_id || "",
      });
      setEditId(conductor.id);
    } else {
      setForm({ name: "", phone: "", employee_id: "", route_id: "" });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleSave = async () => {
    if (editId) {
      await updateConductor(editId, form);
    } else {
      await createConductor(form);
    }
    fetchConductors();
    handleClose();
  };

  const handleDelete = async (id) => {
    await deleteConductor(id);
    fetchConductors();
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "employee_id", headerName: "Employee ID", flex: 1 },
    { field: "route_id", headerName: "Route ID", flex: 1 },
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
        Conductor Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpen()}>
        Add Conductor
      </Button>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid
          rows={conductors}
          columns={columns}
          getRowId={(row) => row.id}
        />
      </div>

      {/* Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "Edit Conductor" : "Add Conductor"}</DialogTitle>
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
            label="Employee ID"
            fullWidth
            value={form.employee_id}
            onChange={(e) =>
              setForm({ ...form, employee_id: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Route ID"
            fullWidth
            value={form.route_id}
            onChange={(e) => setForm({ ...form, route_id: e.target.value })}
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
