// mobile-app/App.tsx
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import RoleSelectionScreen from "./src/screens/RoleSelectionScreen";
import DriverDashboardScreen from "./src/screens/DriverDashboardScreen"; // Ensure this file exists and is named exactly
import ConductorDashboardScreen from "./src/screens/ConductorDashboardScreen"; // Ensure this file exists and is named exactly

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="RoleSelection" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
        <Stack.Screen name="DriverDashboard" component={DriverDashboardScreen} />
        <Stack.Screen name="ConductorDashboard" component={ConductorDashboardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
