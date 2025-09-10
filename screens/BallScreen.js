import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const BOX_SIZE = Math.min(width * 0.6, 250);
const BALL_RADIUS = 12;
const VELOCITY = { x: 1.5, y: 2 };

export default function HiddenBallGame({ navigation }) {
  const [ball, setBall] = useState({
    x: BOX_SIZE / 2,
    y: BOX_SIZE / 2,
    vx: VELOCITY.x,
    vy: VELOCITY.y,
  });
  const [litWall, setLitWall] = useState(null);
  const [clicked, setClicked] = useState(false);
  const [ballVisible, setBallVisible] = useState(true);
  const [locked, setLocked] = useState(false);

  const raf = useRef(null);
  const flickerRef = useRef(null);

  const ballOpacity = useRef(new Animated.Value(1)).current;

  // check if already played today
  useEffect(() => {
    const checkAttempt = async () => {
      const today = new Date().toDateString();
      const lastAttempt = await AsyncStorage.getItem("hiddenBallAttempt");
      if (lastAttempt === today) {
        setLocked(true);
      }
    };
    checkAttempt();
  }, []);

  // animate ball
  useEffect(() => {
    if (locked) return;

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
  }, [locked]);

  // fade out after 2s and then flicker
  useEffect(() => {
    if (locked) return;

    const timeout = setTimeout(() => {
      setBallVisible(false);
    }, 2000);

    flickerRef.current = setInterval(() => {
      if (!ballVisible) {
        Animated.sequence([
          Animated.timing(ballOpacity, {
            toValue: Math.random() * 0.6 + 0.2,
            duration: 150,
            useNativeDriver: true,
          }),
          Animated.timing(ballOpacity, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      clearInterval(flickerRef.current);
    };
  }, [ballVisible, locked]);

  const handlePress = async (e) => {
    if (clicked || locked) return;
    setClicked(true);

    // mark attempt for today
    const today = new Date().toDateString();
    await AsyncStorage.setItem("hiddenBallAttempt", today);

    // stop animation + flicker
    cancelAnimationFrame(raf.current);
    clearInterval(flickerRef.current);

    const { locationX, locationY } = e.nativeEvent;
    const dx = locationX - ball.x;
    const dy = locationY - ball.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= BALL_RADIUS) {
      Alert.alert("🎉 You Win!", "You found the ball!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else {
      Alert.alert("❌ You Failed!", "Try again tomorrow ⏳", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    }
  };

  if (locked) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Hidden Ball</Text>
        <Text style={styles.lockedMessage}>⏳ Come back tomorrow!</Text>
        <Text style={styles.subtitle}>
          You only get one attempt per day.
        </Text>
      </View>
    );
  }

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
        disabled={locked}
      >
        {/* Ball (visible at start, flickers later) */}
        {!locked && (
          <Animated.View
            style={{
              position: "absolute",
              top: ball.y - BALL_RADIUS,
              left: ball.x - BALL_RADIUS,
              width: BALL_RADIUS * 2,
              height: BALL_RADIUS * 2,
              borderRadius: BALL_RADIUS,
              backgroundColor: "white",
              opacity: ballVisible ? 1 : ballOpacity,
            }}
          />
        )}

        {/* Walls */}
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

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
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
  lockedMessage: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#d9534f",
    marginTop: 10,
    textAlign: "center",
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    backgroundColor: "black",
    position: "relative",
  },
  wall: {
    position: "absolute",
  },
  topWall: {
    top: 0,
    left: 0,
    right: 0,
    height: 10,
  },
  bottomWall: {
    bottom: 0,
    left: 0,
    right: 0,
    height: 10,
  },
  leftWall: {
    top: 0,
    bottom: 0,
    left: 0,
    width: 10,
  },
  rightWall: {
    top: 0,
    bottom: 0,
    right: 0,
    width: 10,
  },
  button: {
    backgroundColor: "#2a4d8f",
    paddingVertical: 12,
    borderRadius: 10,
    alignSelf: "stretch",  
    marginTop: 30,        
    maxWidth: 400,       
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    textAlign: "center",
    fontWeight: "600",
  },
});
