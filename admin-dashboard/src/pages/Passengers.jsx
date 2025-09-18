// src/pages/Passengers.jsx
import React, { useEffect, useState } from "react";
import { Button, Typography, Avatar, IconButton, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getPassengers, deletePassenger } from "../api/passenger";
import defaultDriverImg from "../assets/default_driver.jpg";
import DeleteIcon from "@mui/icons-material/Delete";

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
        <IconButton
          color="error"
          onClick={() => handleDelete(params.row.id)}
          aria-label="delete"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Passenger Management
      </Typography>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          marginBottom: 16,
        }}
      >
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
          rows={filteredPassengers}
          columns={columns}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
