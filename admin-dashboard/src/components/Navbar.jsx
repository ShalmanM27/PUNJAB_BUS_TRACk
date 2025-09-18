// src/components/Navbar.jsx
import React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";

export default function Navbar() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">Punjab Bus Tracking – Admin Dashboard</Typography>
      </Toolbar>
    </AppBar>
  );
}
