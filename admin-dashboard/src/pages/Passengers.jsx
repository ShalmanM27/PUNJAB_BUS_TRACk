// src/pages/Passengers.jsx
import React, { useEffect, useState } from "react";
import {
  Button,
  Typography,
  Avatar,
  IconButton,
  TextField,
  Card,
  CardContent,
  Box,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getPassengers, deletePassenger } from "../api/passenger";
import defaultDriverImg from "../assets/default_driver.jpg";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";

export default function Passengers() {
  const [passengers, setPassengers] = useState([]);
  const [search, setSearch] = useState(""); // For name, phone, email
  const [idSearch, setIdSearch] = useState(""); // For ID search

  const fetchPassengers = async () => {
    const data = await getPassengers();
    setPassengers(data);
  };

  useEffect(() => {
    fetchPassengers();
  }, []);

  const handleDelete = async (id) => {
    await deletePassenger(id);
    fetchPassengers();
  };

  // Filtered passengers based on idSearch and search
  const filteredPassengers = passengers.filter((passenger) => {
    const idQ = idSearch.trim();
    const q = search.toLowerCase();
    if (idQ) {
      return passenger.id.toString().includes(idQ);
    }
    return (
      (passenger.name && passenger.name.toLowerCase().includes(q)) ||
      (passenger.phone && passenger.phone.toLowerCase().includes(q)) ||
      (passenger.email && passenger.email.toLowerCase().includes(q))
    );
  });

  const columns = [
    { field: "id", headerName: "ID", width: 80, headerAlign: "center", align: "center", headerClassName: "super-app-theme--header" },
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
    { field: "email", headerName: "Email", flex: 1, headerClassName: "super-app-theme--header" },
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
            Passenger Management
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
            {/* Search by Name/Phone/Email */}
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
                label="Search by Name, Phone, or Email"
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
              rows={filteredPassengers}
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
    </Box>
  );
}
