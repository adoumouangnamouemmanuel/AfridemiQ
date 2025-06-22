import React from "react";
import { Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../src/utils/ThemeContext";

export default function PrivacySettingsScreen() {
  const { theme } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
      padding: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Privacy & Security</Text>
      <Text style={{ color: theme.colors.text }}>
        Privacy settings are under development.
      </Text>
    </SafeAreaView>
  );
}
