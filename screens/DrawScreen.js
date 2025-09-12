import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Canvas, Path, Skia } from "@shopify/react-native-skia";
import { Gesture, GestureDetector } from "react-native-gesture-handler";

export default function DrawScreen({ navigation }) {
  const [path, setPath] = useState(() => Skia.Path.Make());
  const pathRef = useRef(path);
  const pointsRef = useRef([]);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [todayScore, setTodayScore] = useState(0);

  useEffect(() => {
    checkDailyStatus();
  }, []);

  const checkDailyStatus = async () => {
    const today = new Date().toDateString();
    const lastPlayed = await AsyncStorage.getItem("circle-last-played");
    const storedScore = await AsyncStorage.getItem(`circle-score-${today}`);

    if (lastPlayed === today && storedScore) {
      setHasPlayedToday(true);
      setTodayScore(parseInt(storedScore, 10));
    }
  };

  const handleCircleComplete = async (score) => {
    const today = new Date().toDateString();
    await AsyncStorage.setItem(`circle-score-${today}`, score.toString());
    await AsyncStorage.setItem("circle-last-played", today);

    setTodayScore(score);
    setHasPlayedToday(true);

    // 🎯 Score Feedback change later on to update total score
    if (score >= 95) {
      Alert.alert("Perfect!", "🎯 You're a circle master!"); 
    }
  };

  const beginPath = (x, y) => {
    const newPath = Skia.Path.Make();
    newPath.moveTo(x, y);
    pathRef.current = newPath;
    setPath(newPath.copy());
    pointsRef.current = [{ x, y }];
  };

  const movePath = (x, y) => {
    pathRef.current.lineTo(x, y);
    setPath(pathRef.current.copy());
    pointsRef.current.push({ x, y });
  };

  const endPath = () => {
    if (pointsRef.current.length < 10) {
      handleCircleComplete(0);
      return;
    }
    const score = calculateCircleScore(pointsRef.current);
    handleCircleComplete(Math.round(score));
  };

  const resetCanvas = () => {
    const newPath = Skia.Path.Make();
    pathRef.current = newPath;
    setPath(newPath);
    pointsRef.current = [];
    setTodayScore(0);
  };

  // 🔄 Dev Retry Button: clears today's play restriction
  const devRetry = async () => {
    await AsyncStorage.removeItem("shape-last-played");
    await AsyncStorage.removeItem(`shape-score-${new Date().toDateString()}`);
    setHasPlayedToday(false);
    resetCanvas();
  };

  const pan = Gesture.Pan()
    .runOnJS(true)
    .onBegin(({ x, y }) => !hasPlayedToday && beginPath(x, y))
    .onChange(({ x, y }) => !hasPlayedToday && movePath(x, y))
    .onEnd(() => !hasPlayedToday && endPath())
    .onFinalize(() => !hasPlayedToday && endPath());

  // 🔒 FULL LOCKED SCREEN
  if (hasPlayedToday) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Circle Challenge</Text>
        <Text style={styles.lockedMessage}>⏳ Come back tomorrow!</Text>
        <Text style={styles.bigScore}>Your Score Today: {todayScore}/100</Text>
        <Text style={styles.subtitle}>You only get one attempt per day.</Text>

        <TouchableOpacity
          style={[styles.button, { marginTop: 30 }]}
          onPress={() => navigation.navigate("Home")}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </TouchableOpacity>

        {/* 🔄 Dev-only Retry Button */}
        <TouchableOpacity
          style={[styles.devButton, { marginTop: 20 }]}
          onPress={devRetry}
        >
          <Text style={styles.devButtonText}>🔧 Dev Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 🎨 PLAYABLE SCREEN
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Circle Challenge</Text>
      <Text style={styles.subtitle}>
        Try to draw the most perfect circle you can!
      </Text>

      <GestureDetector gesture={pan}>
        <Canvas style={styles.canvas}>
          <Path path={path} color="black" style="stroke" strokeWidth={3} />
        </Canvas>
      </GestureDetector>

      <TouchableOpacity style={styles.button} onPress={resetCanvas}>
        <Text style={styles.buttonText}>Clear</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { marginTop: 15 }]}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </View>



  );
}

function calculateCircleScore(points) {
  if (!points || points.length < 10) return 0;

  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const avgRadius =
    points.reduce(
      (sum, p) => sum + Math.hypot(p.x - centerX, p.y - centerY),
      0
    ) / points.length;

  const variance =
    points.reduce((sum, p) => {
      const r = Math.hypot(p.x - centerX, p.y - centerY);
      return sum + Math.abs(r - avgRadius);
    }, 0) / points.length;

  return Math.max(0, 100 - variance);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#eef3fb",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  lockedMessage: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#d9534f",
    marginTop: 10,
    textAlign: "center",
  },
  bigScore: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 20,
    color: "#2a4d8f",
    textAlign: "center",
  },
  canvas: {
    width: "100%",
    height: 300,
    backgroundColor: "#f6f6f6",
    borderRadius: 12,
    marginVertical: 20,
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
  devButton: {
    backgroundColor: "#f39c12",
    paddingVertical: 12,
    borderRadius: 10,
    width: "100%",
  },
  devButtonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "700",
  },
});
