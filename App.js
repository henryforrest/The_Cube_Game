import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// import your real screens
import HomeScreen from "./screens/HomeScreen";
import DrawScreen from "./screens/DrawScreen";
import LeaderboardScreen from "./screens/LeaderboardScreen";
import OppositeScreen from "./screens/OppositeScreen";
import BallScreen from "./screens/BallScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Draw" component={DrawScreen} />
          <Stack.Screen name="Leaderboard" component={LeaderboardScreen} />
          <Stack.Screen name="Opposite" component={OppositeScreen} />
          <Stack.Screen name="Ball" component={BallScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
