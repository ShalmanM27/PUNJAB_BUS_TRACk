import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Image, ScrollView, Alert } from "react-native";

const CONDUCTOR_ID = 1;

export default function ConductorDashboardScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`http://172.16.140.217:8000/conductor/${CONDUCTOR_ID}`);
      setProfile(await res.json());
    } catch {
      setProfile(null);
    }
  }

  async function fetchSessions() {
    try {
      const res = await fetch(`http://172.16.140.217:8000/session/`);
      const allSessions = await res.json();
      // Filter sessions for CONDUCTOR_ID and next 3 days
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      setSessions(
        allSessions.filter(
          (s: any) =>
            String(s.conductor_id) === String(CONDUCTOR_ID) &&
            new Date(s.start_time) >= now &&
            new Date(s.start_time) <= threeDaysLater
        )
      );
    } catch {
      setSessions([]);
    }
  }

  function canStartSession(session: any) {
    const start = new Date(session.start_time);
    const now = new Date();
    return now >= new Date(start.getTime() - 5 * 60000) && now < start;
  }

  function canEndSession(session: any) {
    return activeSessionId === session.id;
  }

  async function handleStartDrive(session: any) {
    try {
      // Call backend to start session as ConductorTakeover
      await fetch("http://172.16.140.217:8000/session/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...session, takeover_by: "conductor" }),
      });
      setActiveSessionId(session.id);
      setIsTracking(true);
      // TODO: Start GPS tracking here
      Alert.alert("Drive Started (Conductor Takeover)", "GPS tracking started.");
    } catch {
      Alert.alert("Error", "Failed to start drive.");
    }
  }

  async function handleEndDrive(session: any) {
    try {
      // Call backend to end session (blockchain event)
      await fetch("http://172.16.140.217:8000/session/end", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id, takeover_by: "conductor" }),
      });
      setActiveSessionId(null);
      setIsTracking(false);
      // TODO: Stop GPS tracking here
      Alert.alert("Drive Ended", "GPS tracking stopped.");
    } catch {
      Alert.alert("Error", "Failed to end drive.");
    }
  }

  async function handleEmergency(session: any) {
    try {
      await fetch("http://172.16.140.217:8000/session/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: session.id }),
      });
      Alert.alert("Emergency Alert Sent");
    } catch {
      Alert.alert("Error", "Failed to send emergency alert.");
    }
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Conductor Dashboard</Text>
      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        {profile ? (
          <View style={styles.profileRow}>
            {profile.image && (
              <Image source={{ uri: profile.image }} style={styles.profileImage} />
            )}
            <View>
              <Text>Name: {profile.name}</Text>
              <Text>Phone: {profile.phone}</Text>
              <Text>Email: {profile.email}</Text>
            </View>
          </View>
        ) : (
          <Text>Loading profile...</Text>
        )}
      </View>
      {/* Sessions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {sessions.length === 0 && <Text>No sessions found.</Text>}
        {sessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <Text>Vehicle: {session.vehicle_id}</Text>
            <Text>Driver: {session.driver_id ?? "N/A"}</Text>
            <Text>Route: {session.route_name ?? "N/A"}</Text>
            <Text>Date: {new Date(session.start_time).toLocaleString()}</Text>
            <View style={styles.sessionActions}>
              <Button
                title="Start Drive"
                disabled={!canStartSession(session) || !!activeSessionId}
                onPress={() => handleStartDrive(session)}
              />
              <Button
                title="End Drive"
                disabled={!canEndSession(session)}
                onPress={() => handleEndDrive(session)}
              />
              <Button
                title="Emergency"
                disabled={!canEndSession(session)}
                color="red"
                onPress={() => handleEmergency(session)}
              />
            </View>
          </View>
        ))}
      </View>
      {/* Map Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Map (Coming Soon)</Text>
        <View style={styles.mapPlaceholder}>
          <Text>Map will be shown here.</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { fontSize: 24, fontWeight: "bold", margin: 16 },
  section: { margin: 16, marginBottom: 0 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 8 },
  profileRow: { flexDirection: "row", alignItems: "center" },
  profileImage: { width: 64, height: 64, borderRadius: 32, marginRight: 16 },
  sessionCard: { backgroundColor: "#f2f2f2", padding: 12, borderRadius: 8, marginBottom: 12 },
  sessionActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  mapPlaceholder: { height: 180, backgroundColor: "#e0e0e0", alignItems: "center", justifyContent: "center", borderRadius: 8 },
});
