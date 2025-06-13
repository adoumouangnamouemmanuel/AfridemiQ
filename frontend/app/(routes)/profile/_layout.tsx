import { Stack } from "expo-router";
import { useTheme } from "../../../src/utils/ThemeContext";

export default function ProfileLayout() {
  const { theme, isDark } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: isDark
            ? theme.colors.background
            : theme.colors.surface,
        },
        headerTintColor: theme.colors.text,
        headerShadowVisible: false,
        animation: "slide_from_right",
        headerBackTitle: "Back",
        headerTitleStyle: {
          fontFamily: "Inter-SemiBold",
          fontSize: 18,
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: "Profile",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="edit-profile"
        options={{
          title: "Edit Profile",
        }}
      />
      <Stack.Screen
        name="edit-personal-info"
        options={{
          title: "Personal Information",
        }}
      />
      <Stack.Screen
        name="edit-education"
        options={{
          title: "Education",
        }}
      />
      <Stack.Screen
        name="edit-goals"
        options={{
          title: "Goals & Aspirations",
        }}
      />
      <Stack.Screen
        name="edit-bio"
        options={{
          title: "Bio",
        }}
      />
    </Stack>
  );
}
