// src/pages/Admins.jsx
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
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
} from "../api/admin";

export default function Admins() {
  const [admins, setAdmins] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [editId, setEditId] = useState(null);

  // Fetch admins
  const fetchAdmins = async () => {
    const data = await getAdmins();
    setAdmins(data);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  // Open dialog (new or edit)
  const handleOpen = (admin = null) => {
    if (admin) {
      setForm({ name: admin.name, phone: admin.phone, email: admin.email });
      setEditId(admin.id);
    } else {
      setForm({ name: "", phone: "", email: "" });
      setEditId(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Save (create or update)
  const handleSave = async () => {
    if (editId) {
      await updateAdmin(editId, form);
    } else {
      await createAdmin(form);
    }
    fetchAdmins();
    handleClose();
  };

  // Delete admin
  const handleDelete = async (id) => {
    await deleteAdmin(id);
    fetchAdmins();
  };

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      renderCell: (params) => (
        <>
          <Button onClick={() => handleOpen(params.row)}>Edit</Button>
          <Button color="error" onClick={() => handleDelete(params.row.id)}>
            Delete
          </Button>
        </>
      ),
      flex: 1,
    },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Admin Management
      </Typography>
      <Button variant="contained" onClick={() => handleOpen()}>
        Add Admin
      </Button>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid rows={admins} columns={columns} getRowId={(row) => row.id} />
      </div>

      {/* Dialog Form */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{editId ? "Edit Admin" : "Add Admin"}</DialogTitle>
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
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
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
