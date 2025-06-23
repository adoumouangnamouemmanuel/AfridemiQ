import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface LoaderProps {
  visible: boolean;
  text?: string;
  subtitle?: string;
  type?: "default" | "success" | "error" | "warning" | "info";
  size?: "small" | "medium" | "large";
  showProgress?: boolean;
  progress?: number; // 0-100
  duration?: number; // Auto-hide duration for success/error states
  onHide?: () => void;
  theme?: "light" | "dark" | "auto";
  blur?: boolean;
  haptic?: boolean;
}

const Loader: React.FC<LoaderProps> = ({
  visible,
  text,
  subtitle,
  type = "default",
  size = "medium",
  showProgress = false,
  progress = 0,
  duration,
  onHide,
  theme = "light",
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Entrance animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Continuous rotation for default loader
      if (type === "default") {
        const rotateAnimation = Animated.loop(
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        );
        rotateAnimation.start();

        // Pulse animation
        const pulseAnimation = Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.1,
              duration: 1000,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }),
          ])
        );
        pulseAnimation.start();

        return () => {
          rotateAnimation.stop();
          pulseAnimation.stop();
        };
      }
    } else {
      // Exit animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, type, fadeAnim, scaleAnim, rotateAnim, pulseAnim]);

  useEffect(() => {
    if (showProgress) {
      Animated.timing(progressAnim, {
        toValue: progress / 100,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [progress, progressAnim, showProgress]);

  useEffect(() => {
    if (visible && duration && (type === "success" || type === "error")) {
      const timer = setTimeout(() => {
        onHide?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, type, onHide]);

  const getThemeColors = () => {
    const isDark =
      theme === "dark" ||
      (theme === "auto" && /* Add your dark mode detection logic */ false);

    return {
      background: isDark ? "#1F2937" : "#FFFFFF",
      text: isDark ? "#F9FAFB" : "#111827",
      subtitle: isDark ? "#9CA3AF" : "#6B7280",
      overlay: isDark ? "rgba(0, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.6)",
    };
  };

  const getTypeConfig = () => {
    const configs = {
      default: {
        colors: ["#3B82F6", "#1D4ED8"] as [string, string],
        icon: "school" as keyof typeof Ionicons.glyphMap,
        defaultText: "Loading...",
        defaultSubtitle: "Please wait...",
      },
      success: {
        colors: ["#10B981", "#059669"] as [string, string],
        icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
        defaultText: "Success!",
        defaultSubtitle: "Operation completed successfully",
      },
      error: {
        colors: ["#EF4444", "#DC2626"] as [string, string],
        icon: "close-circle" as keyof typeof Ionicons.glyphMap,
        defaultText: "Error",
        defaultSubtitle: "Something went wrong",
      },
      warning: {
        colors: ["#F59E0B", "#D97706"] as [string, string],
        icon: "warning" as keyof typeof Ionicons.glyphMap,
        defaultText: "Warning",
        defaultSubtitle: "Please check and try again",
      },
      info: {
        colors: ["#3B82F6", "#1E40AF"] as [string, string],
        icon: "information-circle" as keyof typeof Ionicons.glyphMap,
        defaultText: "Information",
        defaultSubtitle: "Please note",
      },
    };
    return configs[type];
  };

  const getSizeConfig = () => {
    const configs = {
      small: { container: 200, icon: 50, iconSize: 24, padding: 24 },
      medium: { container: 280, icon: 80, iconSize: 40, padding: 32 },
      large: { container: 320, icon: 100, iconSize: 48, padding: 40 },
    };
    return configs[size];
  };

  if (!visible) return null;

  const themeColors = getThemeColors();
  const typeConfig = getTypeConfig();
  const sizeConfig = getSizeConfig();
  const displayText = text || typeConfig.defaultText;
  const displaySubtitle = subtitle || typeConfig.defaultSubtitle;

  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <>
      {Platform.OS === "ios" && <StatusBar barStyle="light-content" />}
      <Animated.View
        style={[
          styles.overlay,
          { backgroundColor: themeColors.overlay, opacity: fadeAnim },
        ]}
        pointerEvents="auto"
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: themeColors.background,
              width: sizeConfig.container,
              padding: sizeConfig.padding,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Progress Bar */}
          {showProgress && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: typeConfig.colors[0],
                      width: progressAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.progressText, { color: themeColors.subtitle }]}
              >
                {Math.round(progress)}%
              </Text>
            </View>
          )}

          {/* Icon/Loader Container */}
          <Animated.View
            style={[
              styles.loaderBox,
              {
                width: sizeConfig.icon,
                height: sizeConfig.icon,
                transform: [{ scale: pulseAnim }],
              },
            ]}
          >
            {type === "default" ? (
              <Animated.View
                style={{
                  transform: [{ rotate: rotateInterpolate }],
                }}
              >
                <LinearGradient
                  colors={typeConfig.colors}
                  style={[
                    styles.iconContainer,
                    {
                      width: sizeConfig.icon,
                      height: sizeConfig.icon,
                      borderRadius: sizeConfig.icon / 2,
                    },
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ActivityIndicator size="large" color="white" />
                </LinearGradient>
              </Animated.View>
            ) : (
              <LinearGradient
                colors={typeConfig.colors}
                style={[
                  styles.iconContainer,
                  {
                    width: sizeConfig.icon,
                    height: sizeConfig.icon,
                    borderRadius: sizeConfig.icon / 2,
                  },
                ]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons
                  name={typeConfig.icon}
                  size={sizeConfig.iconSize}
                  color="white"
                />
              </LinearGradient>
            )}
          </Animated.View>

          {/* Text Content */}
          <View style={styles.textContainer}>
            <Text
              style={[
                styles.loadingText,
                {
                  color: themeColors.text,
                  fontSize: size === "small" ? 16 : size === "large" ? 22 : 18,
                },
              ]}
              numberOfLines={2}
            >
              {displayText}
            </Text>

            {displaySubtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: themeColors.subtitle,
                    fontSize:
                      size === "small" ? 12 : size === "large" ? 16 : 14,
                  },
                ]}
                numberOfLines={3}
              >
                {displaySubtitle}
              </Text>
            )}
          </View>

          {/* Decorative Elements */}
          <View style={styles.decorativeContainer}>
            {[...Array(3)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.decorativeDot,
                  {
                    backgroundColor: typeConfig.colors[0],
                    opacity: pulseAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.3, 0.8],
                    }),
                    transform: [
                      {
                        scale: pulseAnim.interpolate({
                          inputRange: [1, 1.1],
                          outputRange: [0.8, 1.2],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  container: {
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: SCREEN_WIDTH * 0.85,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
    borderWidth: Platform.OS === "ios" ? 0.5 : 0,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  progressContainer: {
    width: "100%",
    marginBottom: 20,
    alignItems: "center",
  },
  progressTrack: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
  },
  loaderBox: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontWeight: "400",
    textAlign: "center",
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  decorativeContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  decorativeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default Loader;
