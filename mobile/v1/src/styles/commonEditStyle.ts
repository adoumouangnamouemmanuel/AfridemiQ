import { Platform, StyleSheet } from "react-native";
import { useTheme } from "../utils/ThemeContext";

export const useCommonStyles = () => {
  const { theme, isDark } = useTheme();

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 20,
      paddingTop: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 16,
      marginTop: 8,
      fontFamily: "Inter-Bold",
    },
    inputContainer: {
      marginBottom: 16,
    },
    card: {
      backgroundColor: isDark ? "#1F2937" : theme.colors.surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.2 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    footer: {
      flexDirection: "row",
      paddingHorizontal: 20,
      paddingVertical: 16,
      paddingBottom: Platform.OS === "ios" ? 32 : 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: isDark ? "#1F2937" : theme.colors.surface,
      gap: 12,
    },
    button: {
      flex: 1,
      borderRadius: 16,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cancelButton: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    saveButton: {
      backgroundColor: "#3B82F6",
      elevation: 1,
      shadowColor: "#3B82F6",
      shadowOpacity: 0.2,
    },
    saveButtonDisabled: {
      backgroundColor: theme.colors.border,
      elevation: 1,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: "700",
      fontFamily: "Inter-Bold",
    },
    cancelButtonText: {
      color: theme.colors.text,
    },
    saveButtonText: {
      color: "white",
    },
    saveButtonTextDisabled: {
      color: theme.colors.textSecondary,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      color: "white",
      fontSize: 16,
      fontWeight: "700",
      marginLeft: 8,
      fontFamily: "Inter-Bold",
    },
    todoNote: {
      backgroundColor: theme.colors.warning + "15",
      borderRadius: 12,
      padding: 12,
      marginTop: 16,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.warning + "30",
    },
    todoText: {
      fontSize: 12,
      color: theme.colors.warning,
      fontFamily: "Inter-Medium",
      textAlign: "center",
    },
  });
};
