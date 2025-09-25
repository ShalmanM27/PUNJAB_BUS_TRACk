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
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import defaultConductorImg from "../assets/default_driver.jpg";
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
      submitForm.image = await toBase64(defaultConductorImg);
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
    { field: "id", headerName: "ID", width: 80, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
    {
      field: "image",
      headerName: "Photo",
      width: 90,
      headerAlign: "center", align: "center",
      renderCell: (params) => (
        <Avatar
          src={params.row.image || defaultConductorImg}
          alt={params.row.name}
        />
      ),
      headerClassName: "super-app-theme--header"
    },
    { field: "name", headerName: "Name", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "phone", headerName: "Phone", flex: 1, headerClassName: "super-app-theme--header" },
    { field: "email", headerName: "Email", flex: 1, headerClassName: "super-app-theme--header" },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      headerAlign: "center", align: "center",
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
      headerClassName: "super-app-theme--header"
    },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, bgcolor: "#eaf3fb", minHeight: "100vh" }}>
      <Card
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(25,118,210,0.10)",
          background: "linear-gradient(135deg, #eaf3fb 60%, #d0e6ff 100%)",
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, mb: 3, color: "#1565c0" }}
          >
            Conductor Management
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
              Add Conductor
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
                  boxShadow: "0 4px 16px rgba(25,118,210,0.18)",
                },
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
                    color: "#1976d2",
                  },
                }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                sx={{
                  width: 80,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 },
                }}
              />
            </Box>
            {/* Search by Name/Phone/License */}
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
                  boxShadow: "0 4px 16px rgba(25,118,210,0.18)",
                },
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
                    color: "#1976d2",
                  },
                }}
                sx={{
                  minWidth: 220,
                  bgcolor: "transparent",
                  "& .MuiInputBase-input": { py: 1 },
                }}
              />
            </Box>
          </Box>
          <Box sx={{ height: 440, mt: 2 }}>
            <DataGrid
              rows={filteredConductors}
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
                  transition:
                    "transform 0.18s, box-shadow 0.18s, background 0.18s",
                  overflow: "hidden",
                  "&:nth-of-type(even)": {
                    bgcolor: "#e3eafc",
                  },
                  "&:hover": {
                    transform: "scale(1.012)",
                    boxShadow: "0 10px 32px 0 rgba(25,118,210,0.16)",
                    borderLeft: "6px solid #1565c0",
                    bgcolor: "#eaf3fb",
                  },
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
                  overflow: "hidden",
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
                  maxHeight: 64,
                },
                "& .super-app-theme--header": {
                  bgcolor: "transparent",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 19,
                  letterSpacing: 1,
                },
                "& .MuiDataGrid-footerContainer": {
                  bgcolor: "#e3eafc",
                  borderBottomLeftRadius: 16,
                  borderBottomRightRadius: 16,
                },
                "& .MuiDataGrid-virtualScroller": {
                  bgcolor: "transparent",
                },
                "& .MuiDataGrid-columnSeparator": {
                  display: "none",
                },
                "& .MuiDataGrid-root": {
                  border: "none",
                },
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
      <Dialog
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1976d2" }}>
          {editId ? "Edit Conductor" : "Add Conductor"}
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
            <Button
              variant="outlined"
              component="label"
              sx={{ borderRadius: 2 }}
            >
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
                src={form.image || defaultConductorImg}
                alt="Conductor"
                sx={{
                  width: 56,
                  height: 56,
                  boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
                }}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} sx={{ borderRadius: 2 }}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            sx={{ borderRadius: 2 }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
