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
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";

// Use Vite's import.meta.env for environment variables
const NOTIF_API_URL = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL}/admin/notifications/`
  : "http://localhost:8000/admin/notifications/"; // fallback

export default function NotificationLayout() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  const [latest, setLatest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notifState, setNotifState] = useState({});
  const pollingRef = useRef(null);
  const lastNotifIdRef = useRef(null); // Track last notification id
  const wsRef = useRef(null);

  // Helper to check if there are any uncompleted notifications
  const hasUncompleted = (notifs) =>
    notifs.some((n) => !notifState[n.id]?.completed && n.status !== "completed");

  // Polling logic: always poll while mounted
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

          // Check for new notification
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

    fetchNotifications(); // initial fetch
    pollingRef.current = setInterval(fetchNotifications, 2000);

    // --- WebSocket setup ---
    const wsUrl = NOTIF_API_URL.replace(/^http/, "ws") + "ws/notifications";
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onmessage = (event) => {
      try {
        const notif = JSON.parse(event.data);
        setNotifications((prev) => {
          // Avoid duplicates
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
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
    // eslint-disable-next-line
  }, []);

  const unreadCount = notifications.filter((n) => !notifState[n.id]?.read).length;

  const handleClose = () => setOpen(false);

  const handleBellClick = () => {
    setDialogOpen(true);
    // Fetch notifications once when dialog opens
    fetch(NOTIF_API_URL)
      .then((res) => res.ok ? res.json() : [])
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
      // If no notifications left, stop polling
      if (notifications.length === 1 && pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    } catch {}
  };

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 2000 }}>
      <IconButton color="inherit" onClick={handleBellClick}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
        {latest && (
          <Alert
            onClose={handleClose}
            severity={latest.type === "sos" ? "error" : "info"}
            sx={{ width: "100%" }}
          >
            {latest.message}
          </Alert>
        )}
      </Snackbar>
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent dividers>
          {notifications.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No notifications
            </Typography>
          ) : (
            <List>
              {notifications.map((notif) => (
                <ListItem
                  key={notif.id}
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notif.type === "sos" ? "#fff0f0" : "inherit",
                    mb: 1,
                    borderRadius: 1,
                  }}
                >
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center">
                        <Typography
                          variant="subtitle2"
                          color={notif.type === "sos" ? "error" : "primary"}
                        >
                          {notif.type === "sos" ? "SOS" : "Info"}
                        </Typography>
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {notif.message}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      notif.timestamp
                        ? new Date(notif.timestamp).toLocaleString()
                        : ""
                    }
                  />
                  <ListItemSecondaryAction>
                    <Button
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ mr: 1 }}
                      disabled={!!notifState[notif.id]?.read}
                      onClick={() => handleRead(notif.id)}
                    >
                      {notifState[notif.id]?.read
                        ? "Read"
                        : "Mark as Read"}
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      disabled={!!notifState[notif.id]?.completed}
                      onClick={() => handleCompleted(notif.id)}
                    >
                      {notifState[notif.id]?.completed
                        ? "Completed"
                        : "Mark as Completed"}
                    </Button>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}