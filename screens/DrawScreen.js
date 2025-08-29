import React, { useState, useRef } from "react";
import { View, Button, StyleSheet, Alert } from "react-native";
import {
  Canvas,
  Path,
  Skia,
  useTouchHandler,
} from "@shopify/react-native-skia";

export default function DrawScreen() {
  const [path, setPath] = useState(Skia.Path.Make());
  const points = useRef([]); // <-- useRef instead of useValue

  const touchHandler = useTouchHandler({
    onStart: (touch) => {
      const newPath = Skia.Path.Make();
      newPath.moveTo(touch.x, touch.y);
      setPath(newPath);
      points.current = [{ x: touch.x, y: touch.y }];
    },
    onActive: (touch) => {
      path.lineTo(touch.x, touch.y);
      setPath(path.copy());
      points.current.push({ x: touch.x, y: touch.y });
    },
    onEnd: () => {
      const score = calculateCircleScore(points.current);
      Alert.alert("Your Circle Score", `${score.toFixed(2)}%`);
      // TODO: Save score to backend for leaderboard
    },
  });

  const handleReset = () => {
    setPath(Skia.Path.Make());
    points.current = [];
  };

  return (
    <View style={styles.container}>
      <Canvas style={styles.canvas} onTouch={touchHandler}>
        <Path path={path} color="black" style="stroke" strokeWidth={3} />
      </Canvas>
      <Button title="Clear" onPress={handleReset} />
    </View>
  );
}

function calculateCircleScore(points) {
  if (!points || points.length < 10) return 0;

  // Bounding box
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
      (sum, p) =>
        sum + Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2),
      0
    ) / points.length;

  // deviation from average radius
  const variance =
    points.reduce((sum, p) => {
      const r = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
      return sum + Math.abs(r - avgRadius);
    }, 0) / points.length;

  return Math.max(0, 100 - variance); // percent score
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "flex-end",
  },
  canvas: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
});
