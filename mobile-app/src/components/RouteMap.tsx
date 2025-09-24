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
  session?: any; // Session object for GPS transmission
  isLiveTracking?: boolean; // Flag to enable GPS transmission
  onLocationUpdate?: (location: { latitude: number; longitude: number } | null) => void;
}

export function RouteMap({ routeId, session, isLiveTracking = false, onLocationUpdate }: RouteMapProps) {
  const [coordinates, setCoordinates] = useState<Coordinate[]>([]);
  const [markers, setMarkers] = useState<Coordinate[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [region, setRegion] = useState<Region>({
    latitude: 31.582045,
    longitude: 74.329376,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });

  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;
    let gpsTransmissionInterval: NodeJS.Timeout | null = null;

    (async () => {
      // Request location permission first
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission Denied", "Location permission is required to show your current position.");
        onLocationUpdate?.(null);
      } else {
        // Get initial location
        const loc = await Location.getCurrentPositionAsync({});
        const newLocation = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setCurrentLocation(newLocation);
        onLocationUpdate?.(newLocation);
        
        setRegion((prev) => ({
          ...prev,
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        }));

        // Watch location changes
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 1000, // Update every second for smoother tracking
            distanceInterval: 5, // Update when moved 5 meters
          },
          (location) => {
            const newLoc = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            setCurrentLocation(newLoc);
            onLocationUpdate?.(newLoc);
          }
        );

        // Start GPS transmission if live tracking is enabled
        if (isLiveTracking && session) {
          gpsTransmissionInterval = setInterval(() => {
            transmitGPS(newLocation);
          }, 5000); // Every 5 seconds
        }
      }
      fetchRouteData();
    })();

    // Cleanup on unmount
    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
      if (gpsTransmissionInterval) {
        clearInterval(gpsTransmissionInterval);
      }
    };
  }, [isLiveTracking]);

  // Update GPS transmission interval when location changes
  useEffect(() => {
    if (isLiveTracking && session && currentLocation) {
      const interval = setInterval(() => {
        transmitGPS(currentLocation);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [currentLocation, isLiveTracking, session]);

  async function transmitGPS(location: { latitude: number; longitude: number }) {
    if (!session || !location) return;

    try {
      const response = await fetch(`${API_BASE_URL}/telemetry/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.id.toString(),
          driver_id: session.driver_id.toString(),
          latitude: location.latitude,
          longitude: location.longitude,
          speed: 0, // Could be enhanced to calculate from location changes
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.warn('GPS transmission failed:', response.status, errorText);
      } else {
        console.log('GPS transmission successful');
      }
    } catch (error) {
      console.warn('GPS transmission error:', error);
    }
  }

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
