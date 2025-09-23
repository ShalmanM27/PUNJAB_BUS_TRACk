import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, Image, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // adjust path

const DRIVER_ID = 1;

type DriverDashboardNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  "DriverDashboard"
>;

export default function DriverDashboardScreen() {
  const navigation = useNavigation<DriverDashboardNavigationProp>();

  const [profile, setProfile] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    fetchProfile();
    fetchSessions();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch(`http://172.16.140.217:8000/driver/${DRIVER_ID}`);
      setProfile(await res.json());
    } catch {
      setProfile(null);
    }
  }

  async function fetchSessions() {
    try {
      const res = await fetch(`http://172.16.140.217:8000/session/`);
      const allSessions = await res.json();
      const now = new Date();
      const threeDaysLater = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      setSessions(
        allSessions.filter(
          (s: any) =>
            String(s.driver_id) === String(DRIVER_ID) &&
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

  function handleStartDrive(session: any) {
    // ✅ Now correctly typed navigation
    navigation.navigate("MapScreen", { session });
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
              <Image source={{ uri: profile.image }} style={styles.profileImage} />
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

      {/* Upcoming Sessions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Upcoming Sessions</Text>
        {sessions.length === 0 && <Text>No sessions found.</Text>}
        {sessions.map((session) => (
          <View key={session.id} style={styles.sessionCard}>
            <Text>Vehicle: {session.vehicle_id}</Text>
            <Text>Conductor: {session.conductor_id ?? "N/A"}</Text>
            <Text>Route: {session.route_name ?? "N/A"}</Text>
            <Text>Date: {new Date(session.start_time).toLocaleString()}</Text>
            <View style={styles.sessionActions}>
              <Button
                title="Start Drive"
                disabled={!canStartSession(session)}
                onPress={() => handleStartDrive(session)}
              />
            </View>
          </View>
        ))}
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
  sessionActions: { flexDirection: "row", justifyContent: "flex-start", marginTop: 8 },
});
