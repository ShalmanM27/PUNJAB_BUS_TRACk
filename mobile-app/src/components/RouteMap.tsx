import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet, Alert } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";

interface Coordinate {
  latitude: number;
  longitude: number;
  title: string;
}

interface RouteMapProps {
  routeId: string;
}

export function RouteMap({ routeId }: RouteMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);
  const [region, setRegion] = useState({
    latitude: 31.582045,
    longitude: 74.329376,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    fetchRouteData();
  }, []);

  async function fetchRouteData() {
    try {
      const res = await fetch(`http://172.16.140.217:8000/routes/${routeId}`);
      if (!res.ok) throw new Error("Route not found");

      const route = await res.json();

      // Convert backend route_points to coordinates
      const coords: Coordinate[] = [
        { latitude: route.source.latitude, longitude: route.source.longitude, title: "Source" },
        ...route.route_points.map((stop: any) => ({
          latitude: stop.latitude,
          longitude: stop.longitude,
          title: stop.name,
        })),
        { latitude: route.destination.latitude, longitude: route.destination.longitude, title: "Destination" },
      ];

      setCoordinates(coords);

      if (coords.length > 0) {
        setRegion({
          latitude: coords[0].latitude,
          longitude: coords[0].longitude,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }

      setLoading(false);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Failed to load route data.");
      setLoading(false);
    }
  }

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" />;
  }

  return (
    <MapView style={styles.map} initialRegion={region}>
      {coordinates.map((coord, idx) => (
        <Marker
          key={idx}
          coordinate={{ latitude: coord.latitude, longitude: coord.longitude }}
          title={coord.title}
        />
      ))}
      <Polyline
        coordinates={coordinates.map((c) => ({ latitude: c.latitude, longitude: c.longitude }))}
        strokeColor="#FF0000"
        strokeWidth={3}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { flex: 1 },
});
