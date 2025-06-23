import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from "react-native-reanimated";

interface EditProfileSectionProps {
  title: string;
  icon: string;
  description: string;
  items: string[];
  onPress: () => void;
  delay?: number;
  theme: any;
  isDark?: boolean;
}

export const EditProfileSection: React.FC<EditProfileSectionProps> = ({
  title,
  icon,
  description,
  items,
  onPress,
  delay = 0,
  theme,
  isDark = false,
}) => {
  // Animation values
  const scale = useSharedValue(0.95);

  React.useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 15 }));
  }, [scale, delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      overflow: "hidden",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 4,
    },
    content: {
      padding: 20,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 12,
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDark
        ? "rgba(59, 130, 246, 0.2)"
        : "rgba(59, 130, 246, 0.1)",
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      fontFamily: "Inter-Bold",
    },
    description: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    itemsContainer: {
      marginTop: 12,
      backgroundColor: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
      borderRadius: 12,
      padding: 12,
    },
    itemsRow: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    item: {
      backgroundColor: isDark
        ? "rgba(255,255,255,0.1)"
        : "rgba(255,255,255,0.6)",
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 8,
      marginBottom: 8,
    },
    itemText: {
      fontSize: 12,
      color: isDark ? "rgba(255,255,255,0.8)" : theme.colors.textSecondary,
      fontFamily: "Inter-Medium",
    },
    arrowContainer: {
      position: "absolute",
      right: 16,
      top: "50%",
      marginTop: -12,
    },
  });

  return (
    <Animated.View
      style={[styles.container, animatedStyle]}
      entering={FadeIn.delay(300 + delay).duration(500)}
    >
      <TouchableOpacity
        style={styles.content}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={22} color="#3B82F6" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
          <View style={styles.arrowContainer}>
            <Ionicons
              name="chevron-forward"
              size={24}
              color={theme.colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.itemsContainer}>
          <View style={styles.itemsRow}>
            {items.map((item, index) => (
              <View key={index} style={styles.item}>
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};