import React, { useState } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import { RouteMap } from "../components/RouteMap";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../App"; // adjust path if needed
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL as string;

export default function MapScreen({ route }: any) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { session } = route.params;
  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [isRouteEnded, setIsRouteEnded] = useState(false);

  const handleStartTracking = () => {
    setIsLiveTracking(true);
    Alert.alert("Live Tracking Started", "GPS data is being transmitted every 5 seconds.");
  };

  const handleStopTracking = () => {
    setIsLiveTracking(false);
    Alert.alert("Live Tracking Stopped", "GPS transmission has been disabled.");
  };

  const handleEndRoute = async () => {
    Alert.alert(
      "End Route",
      "Are you sure you want to end this route? This action will stop GPS tracking.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "End Route",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLiveTracking(false);
              setIsRouteEnded(true);

              const endTime = new Date().toISOString();

              // Update drive status in backend
              await fetch(`${API_BASE_URL}/drive-status/set`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  session_id: session.id,
                  status: "completed",
                  timestamp: endTime,
                }),
              });

              // Update session end time in database
              const updateResponse = await fetch(`${API_BASE_URL}/session/${session.id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  end_time: endTime,
                  status: 'ended'
                }),
              });

              if (!updateResponse.ok) {
                throw new Error('Failed to update session');
              }

              Alert.alert(
                "Route Ended Successfully",
                "Route has been ended.",
                [
                  {
                    text: "OK",
                    onPress: () => {
                      navigation.navigate("DriverDashboard");
                    }
                  }
                ]
              );

            } catch (error) {
              console.error('End route error:', error);
              Alert.alert(
                "Error",
                "Failed to end route. Please try again.",
                [
                  {
                    text: "OK"
                  }
                ]
              );
              setIsRouteEnded(false);
            }
          }
        }
      ]
    );
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
          {!isRouteEnded ? (
            <>
              <Button
                title="Start Tracking"
                onPress={handleStartTracking}
                disabled={isLiveTracking}
              />
              <Button
                title="Stop Tracking"
                onPress={handleStopTracking}
                disabled={!isLiveTracking}
                color="#FF9800"
              />
            </>
          ) : (
            <Text style={styles.routeEndedText}>Route Ended</Text>
          )}
        </View>
      </View>

      {/* End Route Button */}
      {!isRouteEnded && (
        <View style={styles.endRouteContainer}>
          <Button
            title="End Route"
            onPress={handleEndRoute}
            color="#F44336"
          />
        </View>
      )}

      {currentLocation && (
        <View style={styles.coordinatesContainer}>
          <Text style={styles.coordinatesText}>
            Current Location: {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
          </Text>
          {isLiveTracking && !isRouteEnded && (
            <Text style={styles.transmissionText}>
              📡 Transmitting GPS every 5 seconds
            </Text>
          )}
          {isRouteEnded && (
            <Text style={styles.endedText}>
              ✅ Route ended
            </Text>
          )}
        </View>
      )}
      
      <RouteMap 
        routeId={session.route_id} 
        session={session}
        isLiveTracking={isLiveTracking && !isRouteEnded}
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
  },
  endRouteContainer: {
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  routeEndedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
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
  endedText: {
    fontSize: 12,
    textAlign: 'center',
    color: '#4CAF50',
    marginTop: 4,
    fontWeight: 'bold',
  },
});