import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet, Image, Alert, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Constants from "expo-constants";

const API_BASE_URL = Constants.expoConfig?.extra?.API_BASE_URL as string;

export default function PassengerLoginScreen({ navigation }: { navigation: any }) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    image: "",
  });

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setForm({ ...form, image: result.assets[0].uri });
    }
  };

  const handleSignup = async () => {
    setLoading(true);
    try {
      const payload = {
        ...form,
        email: form.email.trim() === "" ? null : form.email,
        image: form.image.trim() === "" ? null : form.image,
      };
      const res = await fetch(`${API_BASE_URL}/passenger/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).detail || "Signup failed");
      const data = await res.json();
      setLoading(false);
      Alert.alert("Registration successful!");
      navigation.replace("PassengerDashboard", { profile: data });
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Error", e.message);
    }
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/passenger/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: form.phone, password: form.password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Login failed");
      }
      const data = await res.json();
      setLoading(false);
      navigation.replace("PassengerDashboard", { profile: data });
    } catch (e: any) {
      setLoading(false);
      Alert.alert("Login failed", e.message);
    }
  };

  if (mode === "signup") {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Passenger Signup</Text>
        <TextInput style={styles.input} placeholder="Name" value={form.name} onChangeText={v => setForm({ ...form, name: v })} />
        <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
        <TextInput style={styles.input} placeholder="Email (optional)" value={form.email} onChangeText={v => setForm({ ...form, email: v })} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry />
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Text style={{ color: "#007AFF" }}>{form.image ? "Change Profile Image" : "Pick Profile Image"}</Text>
        </TouchableOpacity>
        {form.image ? <Image source={{ uri: form.image }} style={styles.avatar} /> : null}
        <Button title={loading ? "Registering..." : "Register"} onPress={handleSignup} disabled={loading} />
        <Button title="Already have an account? Login" onPress={() => setMode("login")} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Passenger Login</Text>
      <TextInput style={styles.input} placeholder="Phone" value={form.phone} onChangeText={v => setForm({ ...form, phone: v })} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Password" value={form.password} onChangeText={v => setForm({ ...form, password: v })} secureTextEntry />
      <Button title={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
      <Button title="Don't have an account? Signup" onPress={() => setMode("signup")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  title: { fontSize: 28, marginBottom: 30, fontWeight: "bold" },
  input: { width: 250, borderWidth: 1, borderColor: "#ccc", borderRadius: 5, padding: 10, marginBottom: 15 },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 15 },
  imagePicker: { marginBottom: 15 },
});
