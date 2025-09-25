import React, { useState } from "react";
import { View, Text, Image, StyleSheet, TextInput, Button, Alert, TouchableOpacity, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

const defaultImage = require("../assets/default_driver.jpg");

export default function PassengerProfileScreen({ route, navigation }: { route: any, navigation: any }) {
  const { profile } = route.params;
  const [form, setForm] = useState({
    name: profile.name || "",
    phone: profile.phone || "",
    email: profile.email || "",
    image: profile.image || "",
  });
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setForm({ ...form, image: result.assets[0].uri });
      setImageError(false);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        phone: form.phone,
        email: form.email,
        image: form.image,
      };
      const res = await fetch(
        `${Constants.expoConfig?.extra?.API_BASE_URL}/passenger/${profile.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Update failed");
      }
      const updated = await res.json();
      Alert.alert("Profile updated!");
      navigation.setParams({ profile: updated });
      setEditMode(false);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    }
    setLoading(false);
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

  const imageSource = !form.image || imageError
    ? defaultImage
    : { uri: form.image };

  return (
    <View style={styles.container}>
      <TouchableOpacity disabled={!editMode} onPress={editMode ? pickImage : undefined}>
        <Image
          source={imageSource}
          style={styles.avatar}
          onError={() => setImageError(true)}
        />
        {editMode && (
          <Text style={{ color: "#007AFF", textAlign: "center", marginBottom: 10 }}>
            {form.image ? "Change Profile Image" : "Pick Profile Image"}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.infoBox}>
        <Text style={styles.label}>Name:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={form.name}
            onChangeText={v => setForm({ ...form, name: v })}
          />
        ) : (
          <Text style={styles.value}>{form.name}</Text>
        )}
        <Text style={styles.label}>Phone:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={form.phone}
            onChangeText={v => setForm({ ...form, phone: v })}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{form.phone}</Text>
        )}
        <Text style={styles.label}>Email:</Text>
        {editMode ? (
          <TextInput
            style={styles.input}
            value={form.email}
            onChangeText={v => setForm({ ...form, email: v })}
            keyboardType="email-address"
          />
        ) : (
          <Text style={styles.value}>{form.email || "N/A"}</Text>
        )}
      </View>
      {editMode ? (
        <>
          <Button title={loading ? "Updating..." : "Save"} onPress={handleUpdate} disabled={loading} />
          <Button title="Cancel" onPress={() => { setEditMode(false); setForm({ ...form, ...profile }); }} />
          {loading && <ActivityIndicator style={{ marginTop: 10 }} />}
        </>
      ) : (
        <Button title="Update" onPress={() => setEditMode(true)} />
      )}
      <View style={{ marginTop: 30, width: "100%" }}>
        <Button title="Delete Account" color="red" onPress={handleDelete} />
        <View style={{ height: 10 }} />
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20, backgroundColor: "#fff" },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 10, backgroundColor: "#ccc" },
  infoBox: { width: 250, marginBottom: 20 },
  label: { fontWeight: "bold", fontSize: 16, marginTop: 10 },
  value: { fontSize: 16, marginTop: 4, marginBottom: 4, color: "#333" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, fontSize: 16, marginTop: 4, marginBottom: 4 },
});
