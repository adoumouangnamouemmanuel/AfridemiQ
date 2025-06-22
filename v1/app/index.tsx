"use client";

import { useUser } from "../src/utils/UserContext";
import { useTheme } from "../src/utils/ThemeContext";
import { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";

export default function Index() {
  const { user, token, isLoading, isSessionHealthy } = useUser();
  const { theme } = useTheme();
  const [authState, setAuthState] = useState<
    "loading" | "login" | "onboarding" | "home"
  >("loading");

  useEffect(() => {
    const determineAuthState = async () => {
      try {
        console.log("🔍 INDEX: Determining auth state");
        console.log("🔍 INDEX: User:", !!user);
        console.log("🔍 INDEX: Token:", !!token);
        console.log("🔍 INDEX: Session healthy:", isSessionHealthy);
        console.log("🔍 INDEX: Context loading:", isLoading);

        // Wait for UserContext to finish loading
        if (isLoading) {
          console.log("⏳ INDEX: Still loading, waiting...");
          setAuthState("loading");
          return;
        }

        // Check if user is authenticated and session is healthy
        if (!user || !token || !isSessionHealthy) {
          console.log("❌ INDEX: No valid session, redirecting to login");
          setAuthState("login");
          return;
        }

        // User is authenticated, check onboarding status
        console.log("✅ INDEX: User authenticated, checking onboarding status");
        console.log(
          "🔍 INDEX: Onboarding completed:",
          user.onboardingCompleted
        );

        if (user.onboardingCompleted) {
          console.log("✅ INDEX: Onboarding complete, redirecting to home");
            setAuthState("home");
          } else {
          console.log(
            "⚠️ INDEX: Onboarding incomplete, redirecting to onboarding"
          );
            setAuthState("onboarding");
          }
      } catch (error) {
        console.error("❌ INDEX: Error determining auth state:", error);
        setAuthState("login");
      }
    };

    determineAuthState();
  }, [user, token, isLoading, isSessionHealthy]);

  // Show loading while determining auth state
  if (authState === "loading") {
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
