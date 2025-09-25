// admin-dashboard/src/components/Sidebar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Box,
  Avatar,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import EmojiTransportationIcon from "@mui/icons-material/EmojiTransportation";

import DashboardIcon from "@mui/icons-material/Dashboard";
import PeopleIcon from "@mui/icons-material/People";
import DirectionsBusIcon from "@mui/icons-material/DirectionsBus";
import DevicesIcon from "@mui/icons-material/Devices";
import RouteIcon from "@mui/icons-material/AltRoute";
import EventSeatIcon from "@mui/icons-material/EventSeat";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import PersonIcon from "@mui/icons-material/Person";

const menuItems = [
  { text: "Dashboard", path: "/", icon: <DashboardIcon /> },
  { text: "Drivers", path: "/drivers", icon: <PeopleIcon /> },
  { text: "Conductors", path: "/conductors", icon: <SupervisorAccountIcon /> },
  { text: "Passengers", path: "/passengers", icon: <PersonIcon /> },
  { text: "Vehicles", path: "/vehicles", icon: <DirectionsBusIcon /> },
  { text: "Devices", path: "/devices", icon: <DevicesIcon /> },
  { text: "Sessions", path: "/sessions", icon: <EventSeatIcon /> },
  { text: "Routes", path: "/routes", icon: <RouteIcon /> },
];

const StyledSidebar = styled(Paper)(({ theme, open }) => ({
  width: open ? 260 : 0,
  minHeight: "100vh",
  background: "rgba(255,255,255,0.7)",
  backdropFilter: "blur(16px) saturate(180%)",
  WebkitBackdropFilter: "blur(16px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.18)",
  boxShadow: "0 8px 32px 0 rgba(31,38,135,0.15)",
  borderRadius: 0,
  paddingTop: open ? theme.spacing(3) : 0,
  paddingBottom: open ? theme.spacing(3) : 0,
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  position: "fixed",
  left: 0,
  top: 0,
  zIndex: 1400, // higher than overlay
  transition:
    "width 0.3s cubic-bezier(.4,0,.2,1), padding 0.3s cubic-bezier(.4,0,.2,1)",
  overflow: "hidden",
  alignItems: "center",
  [theme.breakpoints.down("md")]: {
    width: open ? 220 : 0,
    paddingTop: open ? theme.spacing(2) : 0,
    paddingBottom: open ? theme.spacing(2) : 0,
  },
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, selected }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  margin: "6px 14px",
  padding: "12px 22px",
  background: selected
    ? "linear-gradient(90deg, #1976d2 0%, #43cea2 100%)"
    : "rgba(255,255,255,0.15)",
  color: selected ? "#fff" : "#222",
  boxShadow: selected ? "0 4px 16px rgba(25,118,210,0.15)" : "none",
  border: selected ? "2px solid #43cea2" : "2px solid transparent",
  transition: "background 0.25s, color 0.25s, border 0.25s",
  "&:hover": {
    background: selected
      ? "linear-gradient(90deg, #1976d2 0%, #43cea2 100%)"
      : "rgba(67,206,162,0.08)",
    color: "#1976d2",
    border: "2px solid #1976d2",
    boxShadow: "0 2px 12px rgba(25,118,210,0.10)",
  },
}));

const SidebarToggle = styled(IconButton)(({ theme }) => ({
  position: "fixed",
  top: 12,
  left: 14,
  zIndex: 1500, // above everything
  background: "rgba(255,255,255,0.85)",
  boxShadow: "0 2px 8px rgba(25,118,210,0.10)",
  "&:hover": {
    background: "#e3eafc",
  },
  [theme.breakpoints.up("md")]: {
    display: "none",
  },
}));

const Sidebar = () => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [open, setOpen] = useState(!isMobile);

  useEffect(() => {
    setOpen(!isMobile);
  }, [isMobile]);

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && open && (
        <Box
          onClick={() => setOpen(false)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(30,40,60,0.18)",
            zIndex: 1300, // below sidebar
          }}
        />
      )}

      {isMobile && (
        <SidebarToggle onClick={() => setOpen((o) => !o)}>
          <MenuIcon fontSize="large" sx={{ color: "#1976d2" }} />
        </SidebarToggle>
      )}

      <StyledSidebar elevation={3} open={open}>
        {/* Shared Icon & Title */}
        <Box
          sx={{
            mb: 4,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            opacity: open ? 1 : 0,
            transition: "opacity 0.3s",
          }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              mb: 1,
              boxShadow: "0 4px 16px rgba(25,118,210,0.18)",
              background: "linear-gradient(135deg, #1976d2 0%, #43cea2 100%)",
            }}
          >
            <EmojiTransportationIcon fontSize="large" />
          </Avatar>
          <Box
            sx={{
              fontWeight: 800,
              fontSize: 22,
              color: "#1976d2",
              letterSpacing: 1,
              textAlign: "center",
              width: "100%",
            }}
          >
            Punjab Bus Admin
          </Box>
        </Box>

        {/* Menu Items */}
        <List
          sx={{
            width: "100%",
            opacity: open ? 1 : 0,
            transition: "opacity 0.2s",
            px: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ width: "100%" }}>
              <StyledListItemButton
                component={Link}
                to={item.path}
                selected={location.pathname === item.path}
                onClick={() => isMobile && setOpen(false)} // close sidebar on mobile click
              >
                <Box
                  sx={{
                    minWidth: 36,
                    mr: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: location.pathname === item.path ? "#fff" : "#1976d2",
                  }}
                >
                  {item.icon}
                </Box>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: location.pathname === item.path ? 800 : 600,
                    fontSize: 17,
                    letterSpacing: 0.5,
                  }}
                />
              </StyledListItemButton>
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        <Box
          sx={{
            textAlign: "center",
            color: "#b0b0b0",
            fontSize: 13,
            pb: 2,
            opacity: open ? 1 : 0,
            transition: "opacity 0.2s",
            width: "100%",
          }}
        >
          &copy; {new Date().getFullYear()} Punjab Bus Tracking
        </Box>
      </StyledSidebar>
    </>
  );
};

export default Sidebar;
