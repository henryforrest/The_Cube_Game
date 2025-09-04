import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");
const BOX_SIZE = width * 0.8;
const BALL_RADIUS = 15;
const VELOCITY = { x: 3, y: 4 }; // constant velocity

export default function HiddenBallGame({ navigation }) {
  const [ball, setBall] = useState({
    x: BOX_SIZE / 2,
    y: BOX_SIZE / 2,
    vx: VELOCITY.x,
    vy: VELOCITY.y,
  });
  const [litWall, setLitWall] = useState(null);
  const [clicked, setClicked] = useState(false);
  const raf = useRef(null);

  // animate ball
  useEffect(() => {
    const animate = () => {
      setBall((prev) => {
        let { x, y, vx, vy } = prev;
        let newLit = null;

        x += vx;
        y += vy;

        if (x <= BALL_RADIUS || x >= BOX_SIZE - BALL_RADIUS) {
          vx = -vx;
          newLit = x <= BALL_RADIUS ? "left" : "right";
        }
        if (y <= BALL_RADIUS || y >= BOX_SIZE - BALL_RADIUS) {
          vy = -vy;
          newLit = y <= BALL_RADIUS ? "top" : "bottom";
        }

        if (newLit) {
          setLitWall(newLit);
          setTimeout(() => setLitWall(null), 200);
        }

        return { x, y, vx, vy };
      });

      raf.current = requestAnimationFrame(animate);
    };

    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const handlePress = (e) => {
    if (clicked) return;
    setClicked(true);

    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - ball.x;
    const dy = locationY - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= BALL_RADIUS) {
      Alert.alert("🎉 You Win!", "You found the ball!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert("❌ You Lose!", "Better luck tomorrow!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hidden Ball</Text>
      <Text style={styles.subtitle}>
        Watch the walls... one chance to click the hidden ball!
      </Text>

      <TouchableOpacity
        activeOpacity={1}
        onPress={handlePress}
        style={styles.box}
      >
        <View
          style={[
            styles.wall,
            styles.topWall,
            { backgroundColor: litWall === "top" ? "#ff4444" : "#cc0000" },
          ]}
        />
        <View
          style={[
            styles.wall,
            styles.bottomWall,
            { backgroundColor: litWall === "bottom" ? "#44ff44" : "#009900" },
          ]}
        />
        <View
          style={[
            styles.wall,
            styles.leftWall,
            { backgroundColor: litWall === "left" ? "#4444ff" : "#0000cc" },
          ]}
        />
        <View
          style={[
            styles.wall,
            styles.rightWall,
            { backgroundColor: litWall === "right" ? "#ffff44" : "#cccc00" },
          ]}
        />
      </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "#555",
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#aaa",
    position: "relative",
  },
  wall: {
    position: "absolute",
  },
  topWall: {
    top: 0,
    left: 0,
    right: 0,
    height: 15,
  },
  bottomWall: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 15,
  },
  leftWall: {
    top: 0,
    bottom: 0,
    left: 0,
    width: 15,
  },
  rightWall: {
    top: 0,
    bottom: 0,
    right: 0,
    width: 15,
  },
});
