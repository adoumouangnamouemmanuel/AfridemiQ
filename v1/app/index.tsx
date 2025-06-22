"use client";

import { useUser } from "../src/utils/UserContext";
import { useTheme } from "../src/utils/ThemeContext";
import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";

export default function Index() {
  const { setUser, setToken } = useUser();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState<
    "loading" | "login" | "onboarding" | "home"
  >("loading");

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        // Check if user is logged in (persisted in storage)
        const userData = await AsyncStorage.getItem("user");
        const token = await AsyncStorage.getItem("token");
        const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");

        if (userData && token) {
          // User is logged in
          const parsedUser = JSON.parse(userData);

          // Convert goalDate back to Date object if it exists
          if (parsedUser.goalDate) {
            parsedUser.goalDate = new Date(parsedUser.goalDate);
          }

          setUser(parsedUser);
          setToken(token);

          if (hasOnboarded) {
            // User is logged in and has completed onboarding
            setAuthState("home");
          } else {
            // User is logged in but hasn't completed onboarding
            setAuthState("onboarding");
          }
        } else {
          // No user found, go to login
          setAuthState("login");
        }
      } catch (error) {
        console.error("Error checking auth state:", error);
        setAuthState("login");
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, [setUser, setToken]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: theme.colors.background,
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // Route based on auth state
  switch (authState) {
    case "login":
      return <Redirect href="/auth/login" />;
    case "onboarding":
      return <Redirect href="/auth/onboarding" />;
    case "home":
      return <Redirect href="/(tabs)/home" />;
    default:
      return <Redirect href="/auth/login" />;
  }
}
