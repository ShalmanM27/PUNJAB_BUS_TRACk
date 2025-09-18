// src/pages/Passengers.jsx
import React, { useEffect, useState } from "react";
import { Button, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getPassengers, deletePassenger } from "../api/passenger";

export default function Passengers() {
  const [passengers, setPassengers] = useState([]);

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

  const columns = [
    { field: "name", headerName: "Name", flex: 1 },
    { field: "phone", headerName: "Phone", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <Button color="error" onClick={() => handleDelete(params.row.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Typography variant="h4" gutterBottom>
        Passenger Management
      </Typography>
      <div style={{ height: 400, marginTop: 20 }}>
        <DataGrid
          rows={passengers}
          columns={columns}
          getRowId={(row) => row.id}
        />
      </div>
    </div>
  );
}
