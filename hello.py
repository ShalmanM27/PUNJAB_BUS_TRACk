# setup_mobile_structure.py
import os
import shutil

BASE_DIR = os.path.join(r"C:\Users\Nishal\Desktop\PUNJAB_BUS_TRACKING","mobile-app")
SRC_DIR = os.path.join(BASE_DIR, "src")

# Define folder structure
folders = [
    "assets",
    os.path.join("src", "api"),
    os.path.join("src", "components"),
    os.path.join("src", "contexts"),
    os.path.join("src", "navigation"),
    os.path.join("src", "screens", "Driver"),
    os.path.join("src", "screens", "Conductor"),
    os.path.join("src", "utils"),
]

# Files to create with boilerplate content
files = {
    os.path.join(SRC_DIR, "App.tsx"): """\
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DriverProfileScreen from "./screens/Driver/ProfileScreen";
import ConductorProfileScreen from "./screens/Conductor/ProfileScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="DriverProfile">
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="ConductorProfile" component={ConductorProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
""",
    os.path.join(SRC_DIR, "screens", "Driver", "ProfileScreen.tsx"): """\
import React from "react";
import { View, Text } from "react-native";

export default function DriverProfileScreen() {
  return (
    <View>
      <Text>Driver Profile Screen</Text>
    </View>
  );
}
""",
    os.path.join(SRC_DIR, "screens", "Conductor", "ProfileScreen.tsx"): """\
import React from "react";
import { View, Text } from "react-native";

export default function ConductorProfileScreen() {
  return (
    <View>
      <Text>Conductor Profile Screen</Text>
    </View>
  );
}
""",
}

def clean_default_files():
    # Remove default App.js and related files created by Expo
    default_files = ["App.js", "App.tsx"]
    for f in default_files:
        fpath = os.path.join(BASE_DIR, f)
        if os.path.exists(fpath):
            print(f"Removing {fpath}")
            os.remove(fpath)

def create_structure():
    for folder in folders:
        path = os.path.join(BASE_DIR, folder)
        os.makedirs(path, exist_ok=True)
        print(f"Created folder: {path}")

    for filepath, content in files.items():
        with open(filepath, "w") as f:
            f.write(content)
        print(f"Created file: {filepath}")

if __name__ == "__main__":
    if not os.path.exists(BASE_DIR):
        print("Expo project not found. Run `npx create-expo-app mobile-app` first.")
    else:
        clean_default_files()
        create_structure()
        print("\n✅ Mobile app structure has been cleaned and set up successfully!")
