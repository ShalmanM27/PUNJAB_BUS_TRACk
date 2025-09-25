import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Image,
  Alert,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import * as Location from "expo-location";
import Constants from "expo-constants";

const defaultImage = require("../assets/default_driver.jpg");

type BusResult = {
  vehicle_id: string;
  route_name: string;
  driver: string;
  eta_minutes: number;
  latitude: number;
  longitude: number;
};

type RoutePoint = { name: string };
type Route = {
  destination?: { name: string };
  route_points?: RoutePoint[];
};

export default function PassengerDashboardScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { profile } = route.params;

  const [imageError, setImageError] = useState(false);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [destination, setDestination] = useState("");
  const [busStop, setBusStop] = useState("");
  const [destOptions, setDestOptions] = useState<string[]>([]);
  const [stopOptions, setStopOptions] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<{ nearest_stop: string; buses: BusResult[] } | null>(null);

  const isValidImageUri = (uri: string | undefined | null) => !!uri && (/^https?:\/\//.test(uri) || uri.startsWith("file://"));

  useEffect(() => setImageError(false), [profile?.image]);

  // Fetch destinations and stops
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${Constants.expoConfig?.extra?.API_BASE_URL}/routes/`);
        const data: Route[] = await res.json();

        setDestOptions([
          ...new Set(
            data.map(r => r.destination?.name).filter((name): name is string => Boolean(name))
          ),
        ]);

        setStopOptions([
          ...new Set(
            data.flatMap(r =>
              (r.route_points || []).map((s: RoutePoint) => s.name)
            ).filter((name): name is string => Boolean(name))
          ),
        ]);
      } catch (e) {
        console.log("Error fetching routes:", e);
      }
    })();
  }, []);

  const handleGetLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") throw new Error("Permission denied");
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e: any) {
      Alert.alert("Location Error", e.message);
    }
    setLocationLoading(false);
  };

  const handleSearch = async () => {
    setSearching(true);
    setResults(null);
    try {
      const body: any = { destination };
      if (busStop) body.bus_stop = busStop;
      if (!busStop && location) {
        body.current_lat = location.latitude;
        body.current_lng = location.longitude;
      }

      const res = await fetch(`${Constants.expoConfig?.extra?.API_BASE_URL}/passenger/search-buses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      setResults({ nearest_stop: data.nearest_stop || "N/A", buses: Array.isArray(data.buses) ? data.buses : [] });
    } catch (e: any) {
      Alert.alert("Search Error", e.message);
    }
    setSearching(false);
  };

  const handleLogout = () => navigation.replace("PassengerLogin");

  const handleDelete = async () => {
    try {
      const res = await fetch(`${Constants.expoConfig?.extra?.API_BASE_URL}/passenger/${profile.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      Alert.alert("Account deleted");
      handleLogout();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  const imageSource = !isValidImageUri(profile?.image) || imageError ? defaultImage : { uri: profile.image };

  return (
    <View style={styles.container}>
      <View style={styles.profileRow}>
        <View style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => navigation.navigate("PassengerProfile", { profile })}>
          <Image source={imageSource} style={styles.avatarSmall} onError={() => setImageError(true)} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Find Your Bus</Text>
      <Button title={location ? "Location Acquired" : "Get Current Location"} onPress={handleGetLocation} disabled={locationLoading} />
      {locationLoading && <ActivityIndicator />}

      <TextInput style={styles.input} placeholder="Enter Destination" value={destination} onChangeText={setDestination} autoCapitalize="words" />
      {destination.length > 0 && destOptions.length > 0 && (
        <FlatList
          data={destOptions.filter(d => d.toLowerCase().includes(destination.toLowerCase()))}
          keyExtractor={item => item}
          renderItem={({ item }) => <TouchableOpacity onPress={() => setDestination(item)}><Text style={styles.suggestion}>{item}</Text></TouchableOpacity>}
          style={styles.suggestionList}
        />
      )}

      <TextInput style={styles.input} placeholder="Optional: Enter Bus Stop" value={busStop} onChangeText={setBusStop} autoCapitalize="words" />
      {busStop.length > 0 && stopOptions.length > 0 && (
        <FlatList
          data={stopOptions.filter(s => s.toLowerCase().includes(busStop.toLowerCase()))}
          keyExtractor={item => item}
          renderItem={({ item }) => <TouchableOpacity onPress={() => setBusStop(item)}><Text style={styles.suggestion}>{item}</Text></TouchableOpacity>}
          style={styles.suggestionList}
        />
      )}

      <Button title="Search Buses" onPress={handleSearch} disabled={!destination || searching} />
      {searching && <ActivityIndicator />}

      {results && (
        <View style={styles.resultsBox}>
          <Text style={styles.resultsTitle}>Nearest Stop: {results.nearest_stop || "N/A"}</Text>
          {results.buses.length === 0 ? <Text>No buses currently running</Text> :
            <FlatList
              data={results.buses}
              keyExtractor={item => item.vehicle_id + item.route_name}
              renderItem={({ item }) => (
                <View style={styles.busCard}>
                  <Text style={styles.busTitle}>Bus #{item.vehicle_id} - {item.route_name}</Text>
                  <Text>Driver: {item.driver || "N/A"}</Text>
                  <Text>ETA: {item.eta_minutes} min</Text>
                  <Text>Location: {item.latitude && item.longitude ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}` : "N/A"}</Text>
                </View>
              )}
            />}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  profileRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  avatarSmall: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#ccc", marginLeft: 10 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 10, alignSelf: "center" },
  input: { borderWidth: 1, borderColor: "#aaa", borderRadius: 8, padding: 8, marginVertical: 8, fontSize: 16 },
  suggestionList: { maxHeight: 80, backgroundColor: "#f9f9f9", borderRadius: 8, marginBottom: 8 },
  suggestion: { padding: 8, fontSize: 16, borderBottomWidth: 1, borderBottomColor: "#eee" },
  resultsBox: { marginTop: 16, padding: 12, backgroundColor: "#f2f2f2", borderRadius: 8, minHeight: 60 },
  resultsTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 6 },
  busCard: { backgroundColor: "#fff", borderRadius: 8, padding: 10, marginVertical: 6, elevation: 1 },
  busTitle: { fontWeight: "bold", fontSize: 16 },
});