import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  getDevices,
  registerDevice,
  updateDevice,
  assignDevice,
  attestDevice,
} from "../api/device";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";

const Devices = () => {
  const [devices, setDevices] = useState([]);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    device_uuid: "",
    user_id: "",
    device_type: "driver",
  });

  const fetchDevices = async () => {
    const data = await getDevices();
    setDevices(data);
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleRegister = async () => {
    try {
      await registerDevice(formData);
      fetchDevices();
      handleClose();
    } catch (err) {
      alert(err.response?.data?.detail || err.message);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", width: 220 },
    { field: "device_uuid", headerName: "Device UUID", width: 200 },
    { field: "user_id", headerName: "Assigned User", width: 150 },
    { field: "device_types", headerName: "Type", width: 120 },
    { field: "attested", headerName: "Attested", width: 100 },
    { field: "last_attestation_hash", headerName: "Attestation Hash", width: 200 },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Device Management</h2>
      <Button variant="contained" color="primary" onClick={handleOpen}>
        Register Device
      </Button>

      <div style={{ height: 500, marginTop: 20 }}>
        <DataGrid rows={devices} columns={columns} pageSize={10} />
      </div>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Register Device</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="device_uuid"
            label="Device UUID"
            type="text"
            fullWidth
            value={formData.device_uuid}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            name="user_id"
            label="User ID (Optional)"
            type="text"
            fullWidth
            value={formData.user_id}
            onChange={handleChange}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Device Type</InputLabel>
            <Select
              name="device_type"
              value={formData.device_type}
              onChange={handleChange}
            >
              <MenuItem value="driver">Driver</MenuItem>
              <MenuItem value="conductor">Conductor</MenuItem>
              <MenuItem value="passenger">Passenger</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleRegister}>
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Devices;
