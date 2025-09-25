import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Button,
  Image,
  ScrollView
} from "react-native";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Constants from "expo-constants";
import { RootStackParamList } from "../../App"; // adjust the path if needed

// ✅ Pull API URL from app.config.js
const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL as string;
const DRIVER_ID = 1;

type DriverDashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DriverDashboard"
>;

export default function DriverDashboardScreen() {
  const navigation = useNavigation<DriverDashboardNavigationProp>();

  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessions, setCurrentSessions] = useState<any[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([]);
  const [driveStatuses, setDriveStatuses] = useState<{ [sessionId: string]: any }>({});

  // ✅ Helper to safely parse date
  function safeDate(dt: string) {
    if (!dt) return null;
    // Replace space with T to ensure correct parsing
    return new Date(dt.replace(" ", "T"));
  }

  async function fetchProfile() {
    try {
      const res = await fetch(`${API_BASE_URL}/driver/${DRIVER_ID}`);
      if (!res.ok) throw new Error("Profile request failed");
      setProfile(await res.json());
    } catch (err) {
      console.warn("Profile fetch error:", err);
      setProfile(null);
    }
  }

  useFocusEffect(
    React.useCallback(() => {
      fetchProfile();
      fetchSessions();
    }, [])
  );

  async function fetchDriveStatus(sessionId: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/drive-status/${sessionId}`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  async function fetchAllDriveStatuses(sessions: any[]) {
    const statuses: { [sessionId: string]: any } = {};
    await Promise.all(
      sessions.map(async (s) => {
        const status = await fetchDriveStatus(s.id);
        statuses[s.id] = status;
      })
    );
    setDriveStatuses(statuses);
  }

  async function fetchSessions() {
    try {
      const res = await fetch(`${API_BASE_URL}/session/`);
      if (!res.ok) throw new Error("Session request failed");
      const allSessions = await res.json();
      const driverSessions = allSessions.filter(
        (s: any) => String(s.driver_id) === String(DRIVER_ID)
      );
      setSessions(driverSessions);
      fetchAllDriveStatuses(driverSessions);
    } catch (err) {
      console.warn("Session fetch error:", err);
      setSessions([]);
      setCurrentSessions([]);
      setUpcomingSessions([]);
    }
  }

  // ✅ Correct classification of current vs upcoming
  useEffect(() => {
    const now = new Date();
    const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    const ongoing = sessions.filter((s: any) => {
      const start = safeDate(s.start_time);
      const end = s.end_time ? safeDate(s.end_time) : null;
      if (!start) return false;
      if (driveStatuses[s.id]?.status === "completed") return false;
      // Ongoing: started already and not ended yet
      return start <= now && (!end || now < end);
    });

    const upcoming = sessions.filter((s: any) => {
      const start = safeDate(s.start_time);
      if (!start) return false;
      if (driveStatuses[s.id]?.status === "completed") return false;
      // Upcoming: strictly after now but within 3 days
      return start > now && start <= threeDaysLater;
    });

    setCurrentSessions(ongoing);
    setUpcomingSessions(upcoming);
  }, [sessions, driveStatuses]);

  async function handleStartDrive(session: any) {
    if (driveStatuses[session.id]?.status !== "started") {
      await fetch(`${API_BASE_URL}/drive-status/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: session.id,
          status: "started",
          timestamp: new Date().toISOString(),
        }),
      });
      await fetchAllDriveStatuses(sessions);
    }
    navigation.navigate("MapScreen", { session });
  }

  function canStartSession(session: any) {
    const start = safeDate(session.start_time);
    if (!start) return false;
    const now = new Date();
    // allow starting within 5 minutes before scheduled time
    return now >= new Date(start.getTime() - 5 * 60000);
  }

  function formatDateTime(dt: string) {
    if (!dt) return "N/A";
    const d = safeDate(dt);
    if (!d) return "Invalid date";
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      " " +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0")
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Driver Dashboard</Text>

      {/* Profile Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        {profile ? (
          <View style={styles.profileRow}>
            {profile.image && (
              <Image
                source={{ uri: profile.image }}
                style={styles.profileImage}
              />
            )}
            <View>
              <Text>Name: {profile.name}</Text>
              <Text>Phone: {profile.phone}</Text>
              <Text>License: {profile.license_number}</Text>
            </View>
          </View>
        ) : (
          <Text>Loading profile...</Text>
        )}
      </View>

      {/* Current Session */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Session</Text>
        {currentSessions.length === 0 && <Text>No ongoing session.</Text>}
        {currentSessions.map((session) => {
          const driveStatus = driveStatuses[session.id]?.status;
          return (
            <View key={session.id} style={styles.sessionCard}>
              <Text>Vehicle: {session.vehicle_id}</Text>
              <Text>Conductor: {session.conductor_id ?? "N/A"}</Text>
              <Text>Route: {session.route_name ?? "N/A"}</Text>
              <Text>Start Time: {formatDateTime(session.start_time)}</Text>
              <Text>End Time: {formatDateTime(session.end_time)}</Text>
              <View style={styles.sessionActions}>
                <Button
                  title={driveStatus === "started" ? "Resume Drive" : "Start Drive"}
                  onPress={() => handleStartDrive(session)}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* Upcoming Sessions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {upcomingSessions.length === 0 && <Text>No upcoming sessions found.</Text>}
        {upcomingSessions.map((session) => {
          const driveStatus = driveStatuses[session.id]?.status;
          return (
            <View key={session.id} style={styles.sessionCard}>
              <Text>Vehicle: {session.vehicle_id}</Text>
              <Text>Conductor: {session.conductor_id ?? "N/A"}</Text>
              <Text>Route: {session.route_name ?? "N/A"}</Text>
              <Text>Start Time: {formatDateTime(session.start_time)}</Text>
              <Text>End Time: {formatDateTime(session.end_time)}</Text>
              <View style={styles.sessionActions}>
                <Button
                  title={driveStatus === "started" ? "Resume Drive" : "Start Drive"}
                  disabled={!canStartSession(session)}
                  onPress={() => handleStartDrive(session)}
                />
              </View>
            </View>
          );
        })}
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
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 16
  },
  sessionCard: {
    backgroundColor: "#f2f2f2",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12
  },
  sessionActions: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 8
  }
});
