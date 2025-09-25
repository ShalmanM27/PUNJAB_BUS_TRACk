import React, { useState, useEffect } from "react";
import { View, Text, Button, StyleSheet, Image, Alert } from "react-native";
import Constants from "expo-constants";

const defaultImage = require("../assets/default_driver.jpg");

export default function PassengerDashboardScreen({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) {
  const { profile } = route.params;
  const [imageError, setImageError] = useState(false);

  // ✅ Utility to check if image URI looks valid
  const isValidImageUri = (uri: string | undefined | null) => {
    if (!uri || typeof uri !== "string") return false;
    // Accept if it starts with http, https, or file://
    return /^https?:\/\//.test(uri) || uri.startsWith("file://");
  };

  // Reset image error when profile changes
  useEffect(() => {
    setImageError(false);
  }, [profile?.image]);

  const handleLogout = () => {
    navigation.replace("PassengerLogin");
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(
        `${Constants.expoConfig?.extra?.API_BASE_URL}/passenger/${profile.id}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Delete failed");
      Alert.alert("Account deleted");
      handleLogout();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
  };

  // ✅ Decide which image to show
  const imageSource =
    !isValidImageUri(profile?.image) || imageError
      ? defaultImage
      : { uri: profile.image };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passenger Profile</Text>

      <Image
        source={imageSource}
        style={styles.avatar}
        onError={() => setImageError(true)} // Catch load failures
      />

      <Text style={styles.label}>Name: {profile?.name}</Text>
      <Text style={styles.label}>Phone: {profile?.phone}</Text>
      <Text style={styles.label}>Email: {profile?.email || "N/A"}</Text>

      <Button title="Delete Account" color="red" onPress={handleDelete} />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    fontWeight: "bold",
  },
  label: {
    fontSize: 18,
    marginVertical: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
    backgroundColor: "#ccc", // optional fallback background
  },
});
