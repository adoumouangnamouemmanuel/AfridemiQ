"use client";

import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter } from "expo-router";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../src/utils/ThemeContext";
import type { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";

// Interface for CustomTabBarButton props, matching expo-router's tabBarButton
interface CustomTabBarButtonProps extends BottomTabBarButtonProps {
  children: React.ReactNode;
}

export default function TabLayout() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Custom header left button
  const HeaderLeftButton = () => (
    <TouchableOpacity
      onPress={() => router.push("/(tabs)/home")}
      style={[styles.headerBackButton, { marginLeft: 10 }]}
      activeOpacity={1}
      delayPressIn={0}
      {...(Platform.OS === "android" && {
        android_ripple: {
          color: theme.colors.primary + "33",
          borderless: false,
        },
      })}
    >
      <Ionicons name="arrow-back" size={28} color={theme.colors.text} />
    </TouchableOpacity>
  );

  // Custom header title component
  const HeaderTitle = () => <Text style={styles.headerTitle}>Profile</Text>;

  // Custom tab bar button with rectangular ripple and no delay
  const CustomTabBarButton = ({
    children,
    onPress,
    style,
    accessibilityState,
    ...rest
  }: CustomTabBarButtonProps) => {
    // Filter out null delayLongPress and similar props
    const filteredRest = Object.fromEntries(
      Object.entries(rest).filter(
        ([key, value]) =>
          !(
            (key === "delayLongPress" ||
              key === "delayPressIn" ||
              key === "delayPressOut") &&
            value === null
          )
      )
    );

    return (
      <TouchableOpacity
        style={[
          style,
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          },
        ]}
        onPress={onPress}
        activeOpacity={1}
        delayPressIn={0}
        accessibilityState={accessibilityState}
        {...(Platform.OS === "android" && {
          android_ripple: {
            color: theme.colors.primary + "100",
            borderless: false,
          },
        })}
        {...filteredRest}
      >
        {children}
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    headerBackButton: {
      paddingLeft: 16,
      paddingRight: 24,
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
          height: Platform.OS === "ios" ? 90 : 65 + insets.bottom,
          paddingBottom: Platform.OS === "ios" ? 40 : 30,
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
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={iconSize} color={color} />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="study"
        options={{
          title: "Study",
          tabBarIcon: ({ color }) => (
            <Ionicons name="book" size={iconSize} color={color} />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="challenges"
        options={{
          title: "Challenges",
          tabBarIcon: ({ color }) => (
            <Ionicons name="trophy" size={iconSize} color={color} />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Leaderboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="podium" size={iconSize} color={color} />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
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
          tabBarIcon: ({ color }) => (
            <Ionicons name="person" size={iconSize} color={color} />
          ),
          tabBarButton: (props) => <CustomTabBarButton {...props} />,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}
