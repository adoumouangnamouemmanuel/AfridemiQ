"use client"

import React from "react"
import { View, StyleSheet } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
  interpolate,
} from "react-native-reanimated"

interface StreakFlameProps {
  streak: number
  size?: number
}

export default function StreakFlame({ streak, size = 24 }: StreakFlameProps) {
  const scale = useSharedValue(1)
  const rotation = useSharedValue(0)

  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(withSpring(1.2, { duration: 1000 }), withSpring(1, { duration: 1000 })),
      -1,
      true,
    )

    rotation.value = withRepeat(
      withSequence(
        withSpring(-5, { duration: 500 }),
        withSpring(5, { duration: 500 }),
        withSpring(0, { duration: 500 }),
      ),
      -1,
      true,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    const flameColor = interpolate(streak, [0, 7, 30, 100], [0, 0.3, 0.7, 1])

    return {
      transform: [{ scale: scale.value }, { rotate: `${rotation.value}deg` }],
      opacity: 0.8 + flameColor * 0.2,
    }
  })

  const getFlameColor = () => {
    if (streak >= 100) return "#FF1744" // Epic flame
    if (streak >= 30) return "#FF5722" // Fire flame
    if (streak >= 7) return "#FF9800" // Hot flame
    return "#FFC107" // Regular flame
  }

  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      justifyContent: "center",
    },
  })

  return (
    <View style={styles.container}>
      <Animated.View style={animatedStyle}>
        <Ionicons name="flame" size={size} color={getFlameColor()} />
      </Animated.View>
    </View>
  )
}
