import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import MapView, { Marker, Polyline, Region } from "react-native-maps";
import * as Location from "expo-location";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL as string;

interface Coordinate {
  latitude: number;
  longitude: number;
  title?: string;
}

interface RouteMapProps {
  routeId: string;
}

export function RouteMap({ routeId }: RouteMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [markers, setMarkers] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState<Region>({
    latitude: 31.582045,
    longitude: 74.329376,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    (async () => {
      // Request location permission first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to show your current position.");
      } else {
        const loc = await Location.getCurrentPositionAsync({});
        setRegion((prev) => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));
      }
      fetchRouteData();
    })();
  }, []);

  async function fetchRouteData() {
    try {
      const res = await fetch(`${API_BASE_URL}/routes/${routeId}`);
      if (!res.ok) throw new Error("Route not found");
      const route = await res.json();

      // Road geometry for polyline
      setCoordinates(route.route_geometry);

      // Markers: Source, stops, destination
      const m: Coordinate[] = [
        { latitude: route.source.latitude, longitude: route.source.longitude, title: "Source" },
        ...route.route_points.map((stop: any) => ({
          latitude: stop.latitude,
          longitude: stop.longitude,
          title: stop.name,
        })),
        { latitude: route.destination.latitude, longitude: route.destination.longitude, title: "Destination" },
      ];
      setMarkers(m);

      if (m.length > 0) {
        setRegion((prev) => ({
          ...prev,
          latitude: m[0].latitude,
          longitude: m[0].longitude,
        }));
      }
      setLoading(false);
    } catch (err) {
      console.warn("Route fetch error:", err);
      Alert.alert("Error", "Failed to load route data.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={region}
      showsUserLocation={true} // 🔵 Blue dot for current location
      showsMyLocationButton={true} // Android: small location button
    >
      {markers.map((coord, idx) => (
        <Marker
          key={idx}
          coordinate={{ latitude: coord.latitude, longitude: coord.longitude }}
          title={coord.title}
        />
      ))}
      {coordinates.length > 1 && (
        <Polyline
          coordinates={coordinates.map((c) => ({
            latitude: c.latitude,
            longitude: c.longitude,
          }))}
          strokeColor="#FF0000"
          strokeWidth={3}
        />
      )}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
  loaderContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});
