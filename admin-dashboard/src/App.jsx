// src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";

import Dashboard from "./pages/Dashboard";
import Admins from "./pages/Admins";
import Drivers from "./pages/Drivers";
import Conductors from "./pages/Conductors";
import Passengers from "./pages/Passengers";
import Vehicles from "./pages/Vehicles";
import Devices from "./pages/Devices";
import Sessions from "./pages/Sessions";
import Telemetry from "./pages/Telemetry";
import Assignments from "./pages/Assignments";
import AuditLogs from "./pages/AuditLogs";
import RoutesPage from "./pages/Routes"; // Add this import

function App() {
  return (
    <Router>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ marginLeft: 240, padding: 20, width: "100%" }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admins" element={<Admins />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/conductors" element={<Conductors />} />
            <Route path="/passengers" element={<Passengers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/telemetry" element={<Telemetry />} />
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/audit-logs" element={<AuditLogs />} />
            <Route path="/routes" element={<RoutesPage />} /> {/* Add this line */}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
