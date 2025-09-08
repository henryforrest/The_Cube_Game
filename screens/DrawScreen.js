import React, { useState, useRef, useEffect } from "react";
import { View, Button, StyleSheet, Alert } from "react-native";
import {
  Canvas,
  Path,
  Skia,
  useTouchHandler,
} from "@shopify/react-native-skia";

export default function DrawScreen() {
  const [path, setPath] = useState(Skia.Path.Make());
  const points = useRef([]);
  const [hasPlayedToday, setHasPlayedToday] = useState(false);
  const [todayScore, setTodayScore] = useState(0);

  useEffect(() => {
    checkDailyStatus();
  }, []);

  const checkDailyStatus = () => {
    const today = new Date().toDateString();
    const lastPlayed = global.localStorage?.getItem('circle-last-played');
    const storedScore = global.localStorage?.getItem(`circle-score-${today}`);

    if (lastPlayed === today && storedScore) {
      setHasPlayedToday(true);
      setTodayScore(parseInt(storedScore));
    } else {
      setHasPlayedToday(false);
      setTodayScore(0);
    }
  };

  const handleCircleComplete = (score) => {
    const today = new Date().toDateString();
    global.localStorage?.setItem(`circle-score-${today}`, score.toString());
    global.localStorage?.setItem('circle-last-played', today);

    setTodayScore(score);
    setHasPlayedToday(true);

    if (score >= 95) {
      Alert.alert("Perfect!", "🎯 You're a circle master!");
    } else if (score >= 85) {
      Alert.alert("Amazing!", "🔥 Almost perfect!");
    } else if (score >= 70) {
      Alert.alert("Great!", "👏 Solid circle!");
    } else {
      Alert.alert("Good effort", "📈 Try again tomorrow!");
    }
  };

  const touchHandler = useTouchHandler({
    onStart: (touch) => {
      const newPath = Skia.Path.Make();
      newPath.moveTo(touch.x, touch.y);
      setPath(newPath);
      points.current = [{ x: touch.x, y: touch.y }];
    },
    onActive: (touch) => {
      const newPath = path.copy();
      newPath.lineTo(touch.x, touch.y);
      setPath(newPath);
      points.current.push({ x: touch.x, y: touch.y });
    },
    onEnd: () => {
      const score = calculateCircleScore(points.current);
      handleCircleComplete(score);
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
      <View style={styles.buttonWrapper}>
        {!hasPlayedToday && <Button title="Clear" onPress={handleReset} />}
        {hasPlayedToday && <Button title={`Today's Score: ${todayScore}`} disabled />}
      </View>
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
      (sum, p) => sum + Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2),
      0
    ) / points.length;

  const variance =
    points.reduce((sum, p) => {
      const r = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
      return sum + Math.abs(r - avgRadius);
    }, 0) / points.length;

  return Math.max(0, 100 - variance);
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  canvas: { flex: 1, backgroundColor: "#f0f0f0" },
  buttonWrapper: { padding: 10, backgroundColor: "#fff" },
});
