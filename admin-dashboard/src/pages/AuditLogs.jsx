import React, { useEffect, useState } from "react";
import { listAuditLogs, getAuditLogById } from "../api/audit";

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = async () => {
    const data = await listAuditLogs();
    setLogs(data);
  };

  const fetchLogDetails = async (logId) => {
    const data = await getAuditLogById(logId);
    setSelectedLog(data);
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <h1>Audit Logs</h1>

      <div>
        <h2>All Logs</h2>
        <ul>
          {logs.map((log) => (
            <li key={log.id}>
              {log.timestamp}: {log.action} by {log.user_id}{" "}
              <button onClick={() => fetchLogDetails(log.id)}>View</button>
            </li>
          ))}
        </ul>
      </div>

      {selectedLog && (
        <div>
          <h2>Audit Details</h2>
          <p>User ID: {selectedLog.user_id}</p>
          <p>Action: {selectedLog.action}</p>
          <pre>Details: {JSON.stringify(selectedLog.details, null, 2)}</pre>
          <p>Timestamp: {selectedLog.timestamp}</p>
        </div>
      )}
    </div>
  );
};

export default AuditLogs;