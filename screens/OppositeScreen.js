import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Opposite</Text>
      <Text style={styles.subtitle}>One attempt a day. How many people think like you?</Text>
      <input type="text" placeholder="Enter your answer" style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 20, width: '100%', paddingHorizontal: 10 }} />
      <Button title="Start" onPress={() => navigation.navigate('Quiz')} />
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

