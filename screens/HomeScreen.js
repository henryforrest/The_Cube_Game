import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}> The Cube - 6 Exciting & Addicitive Minigames</Text>
      <Text style={styles.subtitle}>One attempt a day. How high can you get your score?</Text>
      <Button title="Play the Circle 🎯" onPress={() => navigation.navigate('Draw')} />
      <View style={{ marginTop: 20 }}>
        <Button title="Play Opposite" onPress={() => navigation.navigate('Opposite')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f5f9ff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#666",
  },
});

