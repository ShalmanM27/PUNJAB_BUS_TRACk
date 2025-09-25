import React, { useEffect, useState } from "react";
import api from "../api";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import DevicesIcon from "@mui/icons-material/Devices";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PersonIcon from "@mui/icons-material/Person";

const summaryCards = [
  {
    key: "drivers",
    label: "Drivers",
    icon: <PeopleIcon sx={{ fontSize: 40, color: "#1976d2" }} />,
    color: "#e3eafc",
  },
  {
    key: "conductors",
    label: "Conductors",
    icon: <SupervisorAccountIcon sx={{ fontSize: 40, color: "#43cea2" }} />,
    color: "#e8f5e9",
  },
  {
    key: "passengers",
    label: "Passengers",
    icon: <PersonIcon sx={{ fontSize: 40, color: "#ff9800" }} />,
    color: "#fff3e0",
  },
  {
    key: "vehicles",
    label: "Vehicles",
    icon: <DirectionsBusIcon sx={{ fontSize: 40, color: "#0288d1" }} />,
    color: "#e1f5fe",
  },
  {
    key: "devices",
    label: "Devices",
    icon: <DevicesIcon sx={{ fontSize: 40, color: "#7b1fa2" }} />,
    color: "#f3e5f5",
  },
  {
    key: "sessions",
    label: "Sessions",
    icon: <EventSeatIcon sx={{ fontSize: 40, color: "#388e3c" }} />,
    color: "#e8f5e9",
  },
];

const Dashboard = () => {
  const [summary, setSummary] = useState({
    drivers: 0,
    conductors: 0,
    passengers: 0,
    vehicles: 0,
    devices: 0,
    sessions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSummary = async () => {
    try {
      const [
        driversRes,
        conductorsRes,
        passengersRes,
        vehiclesRes,
        devicesRes,
        sessionsRes,
      ] = await Promise.all([
        api.get("/drivers"),
        api.get("/conductors"),
        api.get("/passengers"),
        api.get("/vehicles"),
        api.get("/devices"),
        api.get("/sessions"),
      ]);
      setSummary({
        drivers: driversRes.data.length,
        conductors: conductorsRes.data.length,
        passengers: passengersRes.data.length,
        vehicles: vehiclesRes.data.length,
        devices: devicesRes.data.length,
        sessions: sessionsRes.data.length,
      });
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch dashboard summary. Please check your backend connection.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "70vh" }}>
        <CircularProgress size={48} color="primary" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, color: "red", textAlign: "center" }}>
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f6f9fc",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        py: { xs: 3, md: 6 },
        px: { xs: 1, md: 0 },
      }}
    >
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          mb: 5,
          color: "#1976d2",
          letterSpacing: 2,
          textShadow: "0 2px 8px rgba(25,118,210,0.10)",
          textAlign: "center",
        }}
      >
        Dashboard Summary
      </Typography>
      <Grid
        container
        spacing={4}
        justifyContent="center"
        sx={{
          maxWidth: 1100,
          width: "100%",
        }}
      >
        {summaryCards.map((card) => (
          <Grid item xs={12} sm={6} md={4} key={card.key}>
            <Card
              sx={{
                borderRadius: 4,
                boxShadow: "0 8px 32px rgba(25,118,210,0.10)",
                bgcolor: card.color,
                transition: "transform 0.18s, box-shadow 0.18s",
                "&:hover": {
                  transform: "translateY(-8px) scale(1.045)",
                  boxShadow: "0 16px 40px rgba(25,118,210,0.18)",
                },
                minHeight: 170,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CardContent
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  width: "100%",
                  justifyContent: "center",
                  py: 3,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    borderRadius: "50%",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    width: 64,
                    height: 64,
                  }}
                >
                  {card.icon}
                </Box>
                <Box sx={{ textAlign: "left" }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, color: "#444", mb: 0.5 }}>
                    {card.label}
                  </Typography>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 900,
                      color: "#222",
                      letterSpacing: 1,
                      lineHeight: 1.1,
                      textShadow: "0 2px 8px rgba(0,0,0,0.07)",
                    }}
                  >
                    {summary[card.key]}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
