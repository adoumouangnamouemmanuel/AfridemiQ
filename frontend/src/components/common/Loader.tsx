import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;

interface LoaderProps {
  visible: boolean;
  text?: string;
  type?: "default" | "success" | "error";
}

const Loader: React.FC<LoaderProps> = ({
  visible,
  text = "Loading...",
  type = "default",
}) => {
  const getColors = (): [string, string] => {
    switch (type) {
      case "success":
        return ["#10b981", "#059669"];
      case "error":
        return ["#ef4444", "#dc2626"];
      default:
        return ["#3B82F6", "#1D4ED8"];
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "close-circle";
      default:
        return "school";
    }
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="auto">
      <View style={styles.container}>
        <View style={styles.loaderBox}>
          {type === "default" ? (
            <ActivityIndicator size="large" color="#3B82F6" />
          ) : (
            <LinearGradient colors={getColors()} style={styles.iconContainer}>
              <Ionicons name={getIcon() as any} size={40} color="white" />
            </LinearGradient>
          )}
        </View>

        <Text style={styles.loadingText}>{text}</Text>

        <Text style={styles.subtitle}>
          {type === "success"
            ? "Success!"
            : type === "error"
            ? "Something went wrong"
            : "Please wait..."}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 250,
    maxWidth: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 15,
    elevation: 10,
  },
  loaderBox: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: isSmallScreen ? 18 : 20,
    fontFamily: "Poppins-Bold",
    fontWeight: "700",
    color: "#1a1a1a",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: isSmallScreen ? 14 : 16,
    fontFamily: "Inter-Regular",
    fontWeight: "400",
    color: "#6B7280",
    textAlign: "center",
  },
});

export default Loader;
