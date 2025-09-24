import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { RouteMap } from "../components/RouteMap";

export default function MapScreen({ route }: any) {
  const { session } = route.params;
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);

  const handleStartTracking = () => {
    setIsLiveTracking(true);
    Alert.alert("Live Tracking Started", "GPS data is being transmitted every 5 seconds.");
  };

  const handleStopTracking = () => {
    setIsLiveTracking(false);
    Alert.alert("Live Tracking Stopped", "GPS transmission has been disabled.");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Route Map</Text>
      
      {/* Live Tracking Controls */}
      <View style={styles.trackingContainer}>
        <View style={styles.trackingStatus}>
          <View style={[styles.statusIndicator, { backgroundColor: isLiveTracking ? '#4CAF50' : '#F44336' }]} />
          <Text style={styles.statusText}>
            Live Tracking: {isLiveTracking ? 'ON' : 'OFF'}
          </Text>
        </View>
        <View style={styles.trackingButtons}>
          <Button
            title="Start Tracking"
            onPress={handleStartTracking}
            disabled={isLiveTracking}
          />
          <Button
            title="Stop Tracking"
            onPress={handleStopTracking}
            disabled={!isLiveTracking}
            color="#F44336"
          />
        </View>
      </View>

      {currentLocation && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            Current Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
          {isLiveTracking && (
            <Text style={styles.transmissionText}>
              📡 Transmitting GPS every 5 seconds
            </Text>
          )}
        </View>
      )}
      
      <RouteMap 
        routeId={session.route_id} 
        session={session}
        isLiveTracking={isLiveTracking}
        onLocationUpdate={setCurrentLocation} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: "bold", textAlign: "center", margin: 12 },
  trackingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  trackingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  trackingButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  coordinatesContainer: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    marginHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 14,
    textAlign: 'center',
    color: '#333',
  },
  transmissionText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: 'bold',
  },
});
