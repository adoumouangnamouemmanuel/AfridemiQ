"use client";

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedProps,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useTheme } from "../../utils/ThemeContext";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SubjectProgressRingProps {
  subject: string;
  progress: number;
  color: string;
  icon: string;
}

export default function SubjectProgressRing({
  subject,
  progress,
  color,
  icon,
}: SubjectProgressRingProps) {
  const { theme } = useTheme();
  const animatedProgress = useSharedValue(0);

  React.useEffect(() => {
    animatedProgress.value = withSpring(progress, { damping: 15 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const radius = 35;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset =
      circumference - (animatedProgress.value / 100) * circumference;
    return {
      strokeDashoffset,
    };
  });

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      padding: 16,
    },
    svgContainer: {
      marginBottom: 12,
    },
    iconContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
      alignItems: "center",
    },
    subjectName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      textAlign: "center",
      fontFamily: "Inter-SemiBold",
    },
    progressText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      textAlign: "center",
      marginTop: 4,
      fontFamily: "Inter-Medium",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.svgContainer}>
        <Svg width={radius * 2 + strokeWidth} height={radius * 2 + strokeWidth}>
          {/* Background circle */}
          <Circle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke={theme.colors.border}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <AnimatedCircle
            cx={radius + strokeWidth / 2}
            cy={radius + strokeWidth / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeLinecap="round"
            animatedProps={animatedProps}
            transform={`rotate(-90 ${radius + strokeWidth / 2} ${
              radius + strokeWidth / 2
            })`}
          />
        </Svg>
        <View style={styles.iconContainer}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
      </View>
      <Text style={styles.subjectName}>{subject}</Text>
      <Text style={styles.progressText}>{progress}% Complete</Text>
    </View>
  );
}
