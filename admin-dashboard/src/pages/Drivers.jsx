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
  IconButton,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import {
  getDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../api/driver";
import defaultDriverImg from "../assets/default_driver.jpg";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

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
  const [idSearch, setIdSearch] = useState(""); // For ID search

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

  // Filtered drivers based on idSearch and search
  const filteredDrivers = drivers.filter((driver) => {
    const idQ = idSearch.trim();
    const q = search.toLowerCase();
    // If idSearch is present, filter by id only
    if (idQ) {
      return driver.id.toString().includes(idQ);
    }
    // Otherwise, filter by name, phone, or license number
    return (
      driver.name.toLowerCase().includes(q) ||
      driver.phone.toLowerCase().includes(q) ||
      driver.license_number.toLowerCase().includes(q)
    );
  });

  const columns = [
    { field: "id", headerName: "ID", width: 80,
      headerAlign: "center", align: "center",
      headerClassName: "super-app-theme--header"
    },
    {
      field: "image",
      headerName: "Photo",
      width: 80,
      headerAlign: "center", align: "center",
      renderCell: (params) => (
        <Avatar
          src={params.row.image || defaultDriverImg}
          alt={params.row.name}
          sx={{
            width: 40,
            height: 40,
            boxShadow: "none",
            border: "1px solid #e3eafc",
            maxWidth: "40px",
            maxHeight: "40px"
          }}
        />
      ),
      headerClassName: "super-app-theme--header"
    },
    { field: "name", headerName: "Name", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "phone", headerName: "Phone", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "license_number", headerName: "License No.", flex: 1, headerClassName: "super-app-theme--header" },
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
            aria-label="delete"
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
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, color: "#1565c0" }}>
            Driver Management
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
              Add Driver
            </Button>
            {/* Contrasting Search by ID */}
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
            {/* Contrasting Search by Name/Phone/License */}
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
                label="Search by Name, Phone, or License"
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
              rows={filteredDrivers}
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
          {editId ? "Edit Driver" : "Add Driver"}
        </DialogTitle>
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
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" component="label" sx={{ borderRadius: 2 }}>
              Upload Photo
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleImageChange}
              />
            </Button>
            <Box sx={{ mt: 2 }}>
              <Avatar
                src={form.image || defaultDriverImg}
                alt="Driver"
                sx={{ width: 56, height: 56, boxShadow: "0 2px 8px rgba(25,118,210,0.10)" }}
              />
            </Box>
          </Box>
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
    </Box>
  );
}
