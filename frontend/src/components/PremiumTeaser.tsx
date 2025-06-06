"use client";

import { TouchableOpacity, Text, StyleSheet, View } from "react-native";
import { useTheme } from "../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface PremiumTeaserProps {
  onPress: () => void;
  message?: string;
  compact?: boolean;
}

export default function PremiumTeaser({
  onPress,
  message,
  compact = false,
}: PremiumTeaserProps) {
  const { theme } = useTheme();

  const pulseAnimation = useSharedValue(1);

  // Start pulse animation
  pulseAnimation.value = withRepeat(
    withTiming(1.03, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
    -1,
    true
  );

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnimation.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      borderRadius: compact ? 8 : 12,
      overflow: "hidden",
      marginVertical: compact ? 8 : 16,
    },
    content: {
      padding: compact ? 12 : 16,
      flexDirection: "row",
      alignItems: "center",
    },
    iconContainer: {
      width: compact ? 40 : 50,
      height: compact ? 40 : 50,
      borderRadius: compact ? 20 : 25,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: compact ? 14 : 16,
      fontWeight: "600",
      color: "white",
      marginBottom: 4,
    },
    message: {
      fontSize: compact ? 12 : 14,
      color: "rgba(255,255,255,0.9)",
      lineHeight: compact ? 16 : 20,
    },
    arrow: {
      marginLeft: 8,
    },
  });

  return (
    <Animated.View style={pulseStyle}>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.9}
      >
        <LinearGradient
          colors={[theme.colors.warning, theme.colors.warning + "CC"]}
          style={StyleSheet.absoluteFillObject}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="diamond" size={compact ? 20 : 24} color="white" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>Upgrade to Premium</Text>
            <Text style={styles.message}>
              {message ||
                "Unlock unlimited practice tests, detailed explanations, and advanced analytics"}
            </Text>
          </View>
          <Ionicons
            name="chevron-forward"
            size={20}
            color="white"
            style={styles.arrow}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}