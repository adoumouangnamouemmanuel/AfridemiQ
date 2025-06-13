"use client";

import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/utils/ThemeContext";

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Custom header left button - without background
  const HeaderLeftButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/home")}
      style={[styles.headerBackButton, { marginLeft: 10 }]} // Added marginLeft: 8 here
    >
      <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
    </TouchableOpacity>
  );

  // Custom header title component
  const HeaderTitle = () => <Text style={styles.headerTitle}>Profile</Text>;

  const styles = StyleSheet.create({
    headerBackButton: {
      paddingLeft: 16,
      paddingRight: 24, // Increased horizontal spacing
      paddingVertical: 8,
    },
    headerTitle: {
      fontFamily: "Inter-Bold",
      fontSize: 20,
      color: theme.colors.text,
    },
  });
  const iconSize = Platform.OS === "ios" ? 24 : 22;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: Platform.OS === "ios" ? 90 : 70 + insets.bottom,
          paddingBottom: Platform.OS === "ios" ? 30 : 10,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontFamily: "Inter-SemiBold",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "Study",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="trophy" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="podium" size={iconSize} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerTitle: () => <HeaderTitle />,
          headerLeft: () => <HeaderLeftButton />,
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.background,
            elevation: 1,
            shadowOpacity: 0,
            borderBottomWidth: 0,
          },
          headerShadowVisible: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
          // Hide bottom tab bar when on profile screen
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
