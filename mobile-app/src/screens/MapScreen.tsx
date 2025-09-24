import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { RouteMap } from "../components/RouteMap";

export default function MapScreen({ route }: any) {
  const { session } = route.params;
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Route Map</Text>
      <RouteMap routeId={session.route_id} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { fontSize: 20, fontWeight: "bold", textAlign: "center", margin: 12 },
});
