import React, { useEffect, useState, useRef } from "react";
import {
  Snackbar,
  Alert,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Typography,
  Box,
  Paper,
  Divider,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Use Vite's import.meta.env for environment variables
const NOTIF_API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/admin/notifications/`
  : "http://localhost:8000/admin/notifications/";

export default function NotificationLayout({ navbarHeight = 72 }) {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [latest, setLatest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifState, setNotifState] = useState({});
  const lastNotifIdRef = useRef(null);
  const wsRef = useRef(null);

  const hasUncompleted = (notifs) =>
    notifs.some((n) => !notifState[n.id]?.completed && n.status !== "completed");

  useEffect(() => {
    let isMounted = true;

    const fetchNotifications = async () => {
      try {
        const res = await fetch(NOTIF_API_URL);
        if (res.status === 404) return;
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;
          setNotifications(data);
          if (data.length > 0) {
            const newest = data[data.length - 1];
            if (lastNotifIdRef.current !== newest.id) {
              setLatest(newest);
              setOpen(true);
              lastNotifIdRef.current = newest.id;
            }
          }
        }
      } catch (e) {}
    };

    fetchNotifications();

    const wsUrl = NOTIF_API_URL.replace(/^http/, "ws") + "ws/notifications";
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data);
        setNotifications((prev) => {
          if (prev.some((n) => n.id === notif.id)) return prev;
          return [...prev, notif];
        });
        setLatest(notif);
        setOpen(true);
        lastNotifIdRef.current = notif.id;
      } catch {}
    };

    wsRef.current.onerror = () => {};
    wsRef.current.onclose = () => {};

    return () => {
      isMounted = false;
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  const unreadCount = notifications.filter((n) => !notifState[n.id]?.read).length;

  const handleClose = () => setOpen(false);

  const handleBellClick = () => {
    setDialogOpen(true);
    fetch(NOTIF_API_URL)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setNotifications(data))
      .catch(() => {});
  };
  const handleDialogClose = () => setDialogOpen(false);

  const handleRead = async (id) => {
    try {
      await fetch(`${NOTIF_API_URL}${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "read" }),
      });
      setNotifState((prev) => ({
        ...prev,
        [id]: { ...prev[id], read: true },
      }));
    } catch {}
  };

  const handleCompleted = async (id) => {
    try {
      await fetch(`${NOTIF_API_URL}${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
      setNotifState((prev) => ({
        ...prev,
        [id]: { ...prev[id], completed: true },
      }));
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch {}
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        right: { xs: 10, md: 32 + 260 },
        zIndex: 2000,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        width: "auto",
        pointerEvents: "none",
        height: { xs: navbarHeight - 8, sm: navbarHeight }, // Adjusted height
        transition: "right 0.3s cubic-bezier(.4,0,.2,1)",
      }}
    >
      <Box
        sx={{
          pointerEvents: "auto",
          height: "100%",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={6}
          sx={{
            borderRadius: "50%",
            boxShadow: "0 8px 32px rgba(67,206,162,0.18)",
            bgcolor: "rgba(255,255,255,0.8)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            p: 0.5,
            transition: "box-shadow 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: 48,
            width: 48,
            mt: "auto",
            mb: "auto", // Center vertically
          }}
        >
          <IconButton
            color="primary"
            onClick={handleBellClick}
            sx={{
              width: 44,
              height: 44,
              "&:hover": {
                bgcolor: "#e3eafc",
                boxShadow: "0 4px 16px rgba(67,206,162,0.18)",
              },
              transition: "box-shadow 0.2s, background 0.2s",
            }}
          >
            <Badge
              badgeContent={unreadCount}
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontWeight: 700,
                  fontSize: 14,
                  minWidth: 24,
                  height: 24,
                  borderRadius: "50%",
                  boxShadow: "0 2px 8px rgba(211,47,47,0.18)",
                  background: "linear-gradient(90deg, #d32f2f 0%, #ff8a65 100%)",
                  color: "#fff",
                },
              }}
            >
              <NotificationsIcon sx={{ fontSize: 32 }} />
            </Badge>
          </IconButton>
        </Paper>
      </Box>

      {/* Snackbar & Dialog code remains the same */}
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        {latest && (
          <Alert
            onClose={handleClose}
            severity={latest.type === "sos" ? "error" : "info"}
            sx={{
              width: "100%",
              borderRadius: 3,
              boxShadow: "0 4px 16px rgba(25,118,210,0.12)",
              fontWeight: 600,
              fontSize: 17,
              background:
                latest.type === "sos"
                  ? "linear-gradient(90deg, #fff0f0 0%, #ffeaea 100%)"
                  : "linear-gradient(90deg, #e3eafc 0%, #f8fafc 100%)",
              color: latest.type === "sos" ? "#d32f2f" : "#1976d2",
            }}
          >
            {latest.message}
          </Alert>
        )}
      </Snackbar>
      {/* Dialog remains unchanged */}
    </Box>
  );
}
