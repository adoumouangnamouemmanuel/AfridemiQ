import { StyleSheet } from "react-native";
import { useTheme } from "../utils/ThemeContext";

export const useCommonOnboarding = () => {
  const { theme } = useTheme();

  return StyleSheet.create({
    title: {
      fontSize: theme.typography.h1.fontSize + 6,
      fontFamily: theme.typography.h1.fontFamily,
      fontWeight: "700",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
      letterSpacing: -1,
      lineHeight: 42,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 26,
      fontWeight: "500",
      marginBottom: 48,
      paddingHorizontal: 10,
      opacity: 0.9,
      letterSpacing: 0.3,
      fontFamily: theme.typography.h2.fontFamily,
    },
  });
};
