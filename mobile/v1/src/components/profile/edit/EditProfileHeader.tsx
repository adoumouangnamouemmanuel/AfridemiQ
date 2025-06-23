import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  FadeIn,
} from "react-native-reanimated";
import type { UserProfile } from "../../../types/user/user.types";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;

interface EditProfileHeaderProps {
  title: string;
  subtitle: string;
  user: UserProfile;
  onBackPress: () => void;
  theme: any;
  isDark?: boolean;
  showAvatar?: boolean;
}

export const EditProfileHeader: React.FC<EditProfileHeaderProps> = ({
  title,
  subtitle,
  user,
  onBackPress,
  isDark = false,
  showAvatar = true,
}) => {
  // Animation values
  const headerScale = useSharedValue(0.95);

  React.useEffect(() => {
    headerScale.value = withDelay(200, withSpring(1, { damping: 15 }));
  }, [headerScale]);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const styles = StyleSheet.create({
    headerContainer: {
      borderRadius: 24,
      overflow: "hidden",
      backgroundColor: isDark ? "#1E3A8A" : "#3B82F6",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.2,
      shadowRadius: 8,
    },
    headerContent: {
      padding: 20,
      position: "relative",
    },
    backButton: {
      position: "absolute",
      top: 16,
      left: 16,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 10,
    },
    headerBody: {
      alignItems: showAvatar ? "center" : "flex-start",
      paddingTop: showAvatar ? 8 : 32,
      paddingBottom: 8,
      paddingLeft: showAvatar ? 0 : 48,
    },
    avatarContainer: {
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.25)",
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: "rgba(255,255,255,0.4)",
    },
    avatarText: {
      color: "white",
      fontSize: 28,
      fontWeight: "800",
      fontFamily: "Inter-Bold",
    },
    headerText: {
      alignItems: showAvatar ? "center" : "flex-start",
    },
    title: {
      fontSize: isSmallScreen ? 22 : 24,
      fontWeight: "800",
      color: "white",
      fontFamily: "Inter-Bold",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: "rgba(255,255,255,0.85)",
      fontFamily: "Inter-SemiBold",
      textAlign: showAvatar ? "center" : "left",
    },
    decorativeCircle1: {
      position: "absolute",
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: "rgba(255,255,255,0.08)",
      top: -50,
      right: -30,
    },
    decorativeCircle2: {
      position: "absolute",
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: "rgba(255,255,255,0.06)",
      bottom: -30,
      left: 20,
    },
  });

  return (
    <Animated.View style={[styles.headerContainer, headerAnimatedStyle]}>
      <View style={styles.headerContent}>
        {/* Decorative elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        <TouchableOpacity style={styles.backButton} onPress={onBackPress}>
          <Ionicons name="arrow-back" size={20} color="white" />
        </TouchableOpacity>

        <View style={styles.headerBody}>
          {showAvatar && (
            <Animated.View
              style={styles.avatarContainer}
              entering={FadeIn.delay(300).duration(500)}
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
              </View>
            </Animated.View>
          )}

          <View style={styles.headerText}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
};