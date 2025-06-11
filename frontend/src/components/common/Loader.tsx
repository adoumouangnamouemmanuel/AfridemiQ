import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, Modal, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

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
  const rotation = useSharedValue(0);
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    if (visible) {
      // Start animations when visible
      rotation.value = withRepeat(
        withTiming(360, {
          duration: 2000,
          easing: Easing.linear,
        }),
        -1
      );

      scale.value = withSequence(
        withTiming(1, { duration: 300 }),
        withRepeat(withTiming(1.1, { duration: 1000 }), -1, true)
      );

      opacity.value = withTiming(1, { duration: 300 });

      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 800 }),
          withTiming(1, { duration: 800 })
        ),
        -1
      );
    } else {
      // Reset animations when hidden
      opacity.value = withTiming(0, { duration: 200 });
      scale.value = withTiming(0.8, { duration: 200 });
    }
  }, [opacity, pulseScale, rotation, scale, visible]);

  const rotationStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const scaleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(pulseScale.value, [1, 1.2], [0.3, 0.1]),
  }));

  const getColors = (): [string, string, ...string[]] => {
    switch (type) {
      case "success":
        return ["#10b981", "#059669", "#047857"];
      case "error":
        return ["#ef4444", "#dc2626", "#b91c1c"];
      default:
        return ["#3B82F6", "#1D4ED8", "#1E40AF"];
    }
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "checkmark-circle";
      case "error":
        return "alert-circle";
      default:
        return "school";
    }
  };

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={["rgba(0,0,0,0.3)", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.3)"]}
          style={styles.gradientOverlay}
        >
          <Animated.View style={[styles.container, scaleStyle]}>
            {/* Pulse Background */}
            <Animated.View style={[styles.pulseBackground, pulseStyle]}>
              <LinearGradient
                colors={getColors()}
                style={styles.pulseGradient}
              />
            </Animated.View>

            {/* Main Loader */}
            <View style={styles.loaderContainer}>
              {/* Outer Ring */}
              <Animated.View style={[styles.outerRing, rotationStyle]}>
                <LinearGradient
                  colors={[...getColors(), "transparent"]}
                  style={styles.ringGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
              </Animated.View>

              {/* Inner Content */}
              <View style={styles.innerContent}>
                <LinearGradient
                  colors={getColors()}
                  style={styles.iconContainer}
                >
                  <Ionicons
                    name={getIcon() as any}
                    size={isSmallScreen ? 32 : 40}
                    color="white"
                  />
                </LinearGradient>
              </View>

              {/* Floating Dots */}
              <View style={styles.dotsContainer}>
                {[0, 1, 2].map((index) => (
                  <Animated.View
                    key={index}
                    style={[
                      styles.dot,
                      {
                        transform: [
                          {
                            rotate: `${index * 120}deg`,
                          },
                        ],
                      },
                      rotationStyle,
                    ]}
                  >
                    <LinearGradient
                      colors={getColors()}
                      style={styles.dotGradient}
                    />
                  </Animated.View>
                ))}
              </View>
            </View>

            {/* Loading Text */}
            <Text style={styles.loadingText}>{text}</Text>

            {/* Subtitle */}
            <Text style={styles.subtitle}>
              {type === "success"
                ? "Success!"
                : type === "error"
                ? "Something went wrong"
                : "Please wait..."}
            </Text>
          </Animated.View>
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  gradientOverlay: {
    flex: 1,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: isSmallScreen ? 30 : 40,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
    // backdropFilter: "blur(10px)", // Not supported in React Native
  },
  pulseBackground: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  pulseGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 75,
  },
  loaderContainer: {
    width: 100,
    height: 100,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  outerRing: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  ringGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 50,
    borderWidth: 3,
    borderColor: "transparent",
  },
  innerContent: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsContainer: {
    position: "absolute",
    width: 120,
    height: 120,
  },
  dot: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    top: 0,
    left: "50%",
    marginLeft: -4,
  },
  dotGradient: {
    width: "100%",
    height: "100%",
    borderRadius: 4,
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
