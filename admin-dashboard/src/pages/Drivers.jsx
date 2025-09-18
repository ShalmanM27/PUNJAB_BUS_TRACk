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
  Avatar,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../api/driver";
import defaultDriverImg from "../assets/default_driver.jpg";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    license_number: "",
    image: "",
  });
  const [editId, setEditId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [search, setSearch] = useState("");

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
        image: driver.image || "",
      });
      setEditId(driver.id);
      setImageFile(null);
    } else {
      setForm({ name: "", phone: "", license_number: "", image: "" });
      setEditId(null);
      setImageFile(null);
    }
    setOpen(true);
  };

  const handleClose = () => setOpen(false);

  // Handle image file change
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

  // Save
  const handleSave = async () => {
    let submitForm = { ...form };
    if (!submitForm.image) {
      // If no image uploaded, use default image
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
      await updateDriver(editId, submitForm);
    } else {
      await createDriver(submitForm);
    }
    fetchDrivers();
    handleClose();
  };

  // Delete
  const handleDelete = async (id) => {
    await deleteDriver(id);
    fetchDrivers();
  };

  // Filtered drivers based on search
  const filteredDrivers = drivers.filter((driver) => {
    const q = search.toLowerCase();
    return (
      driver.id.toString().includes(q) ||
      driver.name.toLowerCase().includes(q) ||
      driver.phone.toLowerCase().includes(q) ||
      driver.license_number.toLowerCase().includes(q)
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
    { field: "license_number", headerName: "License No.", flex: 1 },
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Button variant="contained" onClick={() => handleOpen()}>
          Add Driver
        </Button>
        <TextField
          label="Search by Name, Phone, or License"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ minWidth: 300 }}
        />
      </div>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid
          rows={filteredDrivers}
          columns={columns}
          getRowId={(row) => row.id}
        />
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
                alt="Driver"
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
