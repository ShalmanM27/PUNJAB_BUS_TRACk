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
