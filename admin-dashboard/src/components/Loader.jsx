import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom";
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

  // --- SOS Portal ---
  const sosPortal = (
    latest && latest.type === "sos" && open
      ? ReactDOM.createPortal(
          <Box
            sx={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 32,
              zIndex: 5000,
              display: "flex",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <Paper
              elevation={8}
              sx={{
                px: 4,
                py: 2,
                borderRadius: 3,
                background: "linear-gradient(90deg, #fff0f0 0%, #ffeaea 100%)",
                color: "#d32f2f",
                fontWeight: 800,
                fontSize: 22,
                boxShadow: "0 8px 32px rgba(211,47,47,0.18)",
                textAlign: "center",
                minWidth: 320,
                maxWidth: 600,
                pointerEvents: "auto",
                border: "2px solid #d32f2f",
                animation: "sos-pop 0.4s cubic-bezier(.4,0,.2,1)",
              }}
            >
              🚨 {latest.message}
            </Paper>
            <style>
              {`
                @keyframes sos-pop {
                  0% { transform: translateY(40px) scale(0.95); opacity: 0; }
                  100% { transform: translateY(0) scale(1); opacity: 1; }
                }
              `}
            </style>
          </Box>,
          document.body
        )
      : null
  );

  return (
    <>
      {/* Fixed Bell Icon at Top Right */}
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
          height: { xs: navbarHeight - 8, sm: navbarHeight },
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
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: 48,
              width: 48,
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
      </Box>

      {/* SOS Message Portal */}
      {sosPortal}

      {/* Dialog for notifications */}
      <Dialog open={dialogOpen} onClose={handleDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent dividers>
          {notifications.length === 0 ? (
            <Typography>No notifications.</Typography>
          ) : (
            <List>
              {notifications.map((notif) => (
                <React.Fragment key={notif.id}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{
                      bgcolor: notif.type === "sos" ? "#fff0f0" : "#f8fafc",
                      borderRadius: 2,
                      mb: 1,
                      boxShadow:
                        notif.type === "sos"
                          ? "0 2px 8px rgba(211,47,47,0.08)"
                          : "0 2px 8px rgba(25,118,210,0.08)",
                    }}
                  >
                    <ListItemText
                      primary={
                        <Typography
                          sx={{
                            fontWeight: notif.type === "sos" ? 700 : 500,
                            color: notif.type === "sos" ? "#d32f2f" : "#1976d2",
                          }}
                        >
                          {notif.message}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {notif.timestamp}
                        </Typography>
                      }
                    />
                    <ListItemSecondaryAction>
                      {notif.status !== "completed" && (
                        <>
                          <Button
                            size="small"
                            color="primary"
                            onClick={() => handleRead(notif.id)}
                            disabled={notifState[notif.id]?.read}
                            sx={{ mr: 1 }}
                          >
                            Mark as Read
                          </Button>
                          <Button
                            size="small"
                            color="success"
                            onClick={() => handleCompleted(notif.id)}
                          >
                            Completed
                          </Button>
                        </>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
