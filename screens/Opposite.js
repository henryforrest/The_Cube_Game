import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const words = [
  "pizza",
  "rain",
  "music",
  "cloud",
  "friendship",
  "coffee",
  "robot",
  "mountain",
  "mirror",
  "dog",
];

let answers = {}; // demo only, reset on app restart

export default function OppositeScreen({ navigation }) {
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [todayWord, setTodayWord] = useState("");
  const [todayKey, setTodayKey] = useState("");

  useEffect(() => {
    // Word of the day (deterministic)
    const todayIndex =
      Math.floor(Date.now() / (1000 * 60 * 60 * 24)) % words.length;
    setTodayWord(words[todayIndex]);

    // Daily storage key
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const key = `submitted-${today}`;
    setTodayKey(key);

    // Check if already submitted
    (async () => {
      const already = await AsyncStorage.getItem(key);
      if (already) {
        setSubmitted(true);
        setAnswer(already);
      }
    })();
  }, []);

  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitted(true);

    // Save answer so user can’t submit again today
    await AsyncStorage.setItem(todayKey, answer);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Opposite</Text>
        <Text style={styles.wordOfDay}>Word of the day:</Text>
        <Text style={styles.word}>{todayWord}</Text>

        {!submitted ? (
          <>
            <TextInput
              placeholder="Enter what you think is the opposite..."
              value={answer}
              onChangeText={setAnswer}
              style={styles.input}
            />

            <TouchableOpacity style={styles.button} onPress={handleSubmit}>
              <Text style={styles.buttonText}>Submit</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.resultBox}>
            <Text style={styles.subtitle}>
              You answered:{" "}
              <Text style={{ fontWeight: "bold" }}>{answer}</Text>
            </Text>

            {(() => {
              // Update the answers object (demo only)
              if (answers[answer]) {
                answers[answer] += 1;
              } else {
                answers[answer] = 1;
              }

              let percentage = (
                (answers[answer] /
                  Object.values(answers).reduce((a, b) => a + b, 0)) *
                100
              ).toFixed(2);

              return (
                <Text style={styles.resultText}>
                  {percentage}% of players gave the same answer
                </Text>
              );
            })()}

            <TouchableOpacity
              style={[styles.button, { marginTop: 30 }]}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={styles.buttonText}>Back to Home</Text>
            </TouchableOpacity>
          </View>
        )}
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
  wordOfDay: {
    textAlign: "center",
    fontSize: 16,
    color: "#777",
    marginTop: 10,
  },
  word: {
    fontSize: 24,
    fontWeight: "600",
    textAlign: "center",
    marginVertical: 15,
    color: "#2a4d8f",
  },
  input: {
    height: 45,
    borderColor: "#bbb",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#fafafa",
  },
  button: {
    backgroundColor: "#2a4d8f",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#444",
    marginBottom: 10,
  },
  resultBox: {
    marginTop: 20,
    alignItems: "center",
  },
  resultText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2a4d8f",
    marginTop: 10,
  },
});
