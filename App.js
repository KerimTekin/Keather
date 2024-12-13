import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import Homepage from "./screens/Homepage";
import { StyleSheet } from "react-native";
import SliderBar from "./components/sliderbar";

const Drawer = createDrawerNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <SliderBar {...props} />}
        screenOptions={{
          drawerStyle: {
            backgroundColor: "#004c70",
          },
        }}
      >
        <Drawer.Screen
          name="Home"
          component={Homepage}
          options={{ headerShown: false }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
