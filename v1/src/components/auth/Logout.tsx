"use client";

import type React from "react";
import { Alert, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { apiService } from "../../services/api.service";
import { useUser } from "../../utils/UserContext";

interface LogoutButtonProps {
  style?: any;
  textStyle?: any;
  title?: string;
}

// Reusable logout component
export const LogoutButton: React.FC<LogoutButtonProps> = ({
  style,
  textStyle,
  title = "Logout",
}) => {
  const { setUser, setToken } = useUser();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            // Call logout service
            await apiService.logout();

            // Clear user context
            setUser(null);
            setToken(null);

            // Navigate to login screen
            router.replace("/auth/login");
          } catch (error) {
            console.error("Logout error:", error);
            // Even if API call fails, clear local data and navigate
            setUser(null);
            setToken(null);
            router.replace("/auth/login");
          }
        },
      },
    ]);
  };

  return (
    <TouchableOpacity
      style={[styles.logoutButton, style]}
      onPress={handleLogout}
    >
      <Text style={[styles.logoutText, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  logoutButton: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  logoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
});