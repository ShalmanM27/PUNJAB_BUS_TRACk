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
  Avatar,
  IconButton,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getConductors,
  createConductor,
  updateConductor,
  deleteConductor,
} from "../api/conductor";
import defaultDriverImg from "../assets/default_driver.jpg";
import DeleteIcon from "@mui/icons-material/Delete";

export default function Conductors() {
  const [conductors, setConductors] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    image: "",
  });
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [search, setSearch] = useState(""); // For name, phone, email
  const [idSearch, setIdSearch] = useState(""); // For ID search

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
        email: conductor.email || "",
        image: conductor.image || "",
      });
      setEditId(conductor.id);
      setImageFile(null);
    } else {
      setForm({ name: "", phone: "", email: "", image: "" });
      setEditId(null);
      setImageFile(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    let submitForm = { ...form };
    if (!submitForm.image) {
      // Convert default image to base64
      const toBase64 = (url) =>
        fetch(url)
          .then((res) => res.blob())
          .then(
            (blob) =>
              new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
              })
          );
      submitForm.image = await toBase64(defaultDriverImg);
    }
    if (editId) {
      await updateConductor(editId, submitForm);
    } else {
      await createConductor(submitForm);
    }
    fetchConductors();
    handleClose();
  };

  const handleDelete = async (id) => {
    await deleteConductor(id);
    fetchConductors();
  };

  // Filtered conductors based on idSearch and search
  const filteredConductors = conductors.filter((conductor) => {
    const idQ = idSearch.trim();
    const q = search.toLowerCase();
    // If idSearch is present, filter by id only
    if (idQ) {
      return conductor.id.toString().includes(idQ);
    }
    // Otherwise, filter by name, phone, or email
    return (
      (conductor.name && conductor.name.toLowerCase().includes(q)) ||
      (conductor.phone && conductor.phone.toLowerCase().includes(q)) ||
      (conductor.email && conductor.email.toLowerCase().includes(q))
    );
  });

  const columns = [
    { field: "id", headerName: "ID", width: 80 },
    {
      field: "image",
      headerName: "Photo",
      width: 90,
      renderCell: (params) => (
        <Avatar
          src={params.row.image || defaultDriverImg}
          alt={params.row.name}
        />
      ),
    },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
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
            aria-label="delete"
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
        Conductor Management
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
          Add Conductor
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
          label="Search by Name, Phone, or Email"
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
          rows={filteredConductors}
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
            label="Email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <div style={{ marginTop: 16 }}>
            <Button variant="outlined" component="label">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            <div style={{ marginTop: 8 }}>
              <Avatar
                src={form.image || defaultDriverImg}
                alt="Conductor"
                sx={{ width: 56, height: 56 }}
              />
            </div>
          </div>
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
