import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>The Cube</Text>
        <Text style={styles.subtitle}>
          6 Exciting & Addictive Minigames
        </Text>
        <Text style={styles.wordOfDay}>
          One attempt a day. How high can you get your score?
        </Text>

        <TouchableOpacity
          style={[styles.button, { marginTop: 20 }]}
          onPress={() => navigation.navigate("Draw")}
        >
          <Text style={styles.buttonText}>Play the Circle 🎯</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 15 }]}
          onPress={() => navigation.navigate("Opposite")}
        >
          <Text style={styles.buttonText}>Play Opposite</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { marginTop: 15 }]}
          onPress={() => navigation.navigate("HiddenBallGame")}
        >
          <Text style={styles.buttonText}>Play Hidden Ball 🔮</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef3fb",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#2a4d8f",
    marginBottom: 8,
    fontWeight: "600",
  },
  wordOfDay: {
    textAlign: "center",
    fontSize: 16,
    color: "#555",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#2a4d8f",
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});
