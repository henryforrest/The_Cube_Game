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

export default function ShapeMemoryScreen({ navigation }) {
  const [path, setPath] = useState(() => Skia.Path.Make());
  const [targetShape, setTargetShape] = useState(() => generateShape());
  const [showShape, setShowShape] = useState(true);
  const pathRef = useRef(path);
  const pointsRef = useRef([]);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [todayScore, setTodayScore] = useState(0);

  useEffect(() => {
    checkDailyStatus();

    // Hide the shape after 3 seconds
    const timer = setTimeout(() => setShowShape(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const checkDailyStatus = async () => {
    const today = new Date().toDateString();
    const lastPlayed = await AsyncStorage.getItem("shape-last-played");
    const storedScore = await AsyncStorage.getItem(`shape-score-${today}`);

    if (lastPlayed === today && storedScore) {
      setHasPlayedToday(true);
      setTodayScore(parseInt(storedScore, 10));
    }
  };

  const handleShapeComplete = async (score) => {
    const today = new Date().toDateString();
    await AsyncStorage.setItem(`shape-score-${today}`, score.toString());
    await AsyncStorage.setItem("shape-last-played", today);

    setTodayScore(score);
    setHasPlayedToday(true);

    if (score >= 95) {
      Alert.alert("Perfect!", "🎯 You memorised it perfectly!");
    } else if (score >= 85) {
      Alert.alert("Amazing!", "🔥 Almost perfect!");
    } else if (score >= 70) {
      Alert.alert("Great!", "👏 Solid memory!");
    } else {
      Alert.alert("Good effort", "📈 Try again tomorrow!");
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
    if (pointsRef.current.length < 5) {
      handleShapeComplete(0);
      return;
    }
    const score = compareShapes(pointsRef.current, targetShape);
    handleShapeComplete(Math.round(score));
  };

  const resetCanvas = () => {
    const newPath = Skia.Path.Make();
    pathRef.current = newPath;
    setPath(newPath);
    pointsRef.current = [];
    setTodayScore(0);
    setTargetShape(generateShape());
    setShowShape(true);
    setTimeout(() => setShowShape(false), 3000);
  };

  // 🔄 Dev Retry Button: clears today's play restriction
  const devRetry = async () => {
    await AsyncStorage.removeItem("shape-last-played");
    await AsyncStorage.removeItem(`shape-score-${new Date().toDateString()}`);
    setHasPlayedToday(false);
    resetCanvas();
    Alert.alert("🔧 Dev Retry", "Daily lock has been reset!");
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
        <Text style={styles.title}>Shape Memory</Text>
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
      <Text style={styles.title}>Shape Memory</Text>
      <Text style={styles.subtitle}>
        Memorise the shape and replicate it from memory!
      </Text>

      <GestureDetector gesture={pan}>
        <Canvas style={styles.canvas}>
          {showShape && (
            <Path
              path={targetShape}
              color="#2a4d8f"
              style="stroke"
              strokeWidth={3}
            />
          )}
          <Path path={path} color="black" style="stroke" strokeWidth={3} />
        </Canvas>
      </GestureDetector>

      <TouchableOpacity
        style={[styles.button, { marginTop: 15 }]}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>

    </View>
  );
}

// Simple shape generator (random squiggle)
function generateShape() {
  const path = Skia.Path.Make();
  let x = Math.random() * 250 + 25;
  let y = Math.random() * 250 + 25;
  path.moveTo(x, y);

  for (let i = 0; i < 5; i++) {
    x += Math.random() * 100 - 50;
    y += Math.random() * 100 - 50;
    path.lineTo(x, y);
  }

  return path;
}

// Compare user path to target shape
function compareShapes(userPoints, targetPath) {
  const targetPoints = samplePath(targetPath, 20);
  let score = 100;
  const len = Math.min(userPoints.length, targetPoints.length);
  for (let i = 0; i < len; i++) {
    const d = Math.hypot(
      userPoints[i].x - targetPoints[i].x,
      userPoints[i].y - targetPoints[i].y
    );
    score -= d / 2;
  }
  return Math.max(0, score);
}

// Simple path sampler
function samplePath(path, numPoints) {
  const points = [];
  const bounds = path.getBounds();
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: bounds.x + (i / numPoints) * bounds.width,
      y: bounds.y + Math.random() * bounds.height,
    });
  }
  return points;
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
