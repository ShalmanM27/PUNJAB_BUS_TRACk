import React from "react";
import { View, Button, StyleSheet, Text } from "react-native";

export default function RoleSelectionScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Role</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Driver"
          onPress={() => navigation.replace("DriverDashboard")}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Conductor"
          onPress={() => navigation.replace("ConductorDashboard")}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Passenger"
          onPress={() => navigation.replace("PassengerLogin")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, marginBottom: 40, fontWeight: "bold" },
  buttonContainer: { marginVertical: 10, width: 200 },
});
