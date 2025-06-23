import { Stack, useRouter } from "expo-router";
import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../../src/utils/ThemeContext";

import { Ionicons } from "@expo/vector-icons";

export default function ProfileLayout() {
  const { theme, isDark } = useTheme();
  const router = useRouter();

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

  // Custom header left button
  const HeaderLeftButton = () => (
    <TouchableOpacity
      onPress={() => router.back()}
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
  const HeaderTitle = ({ route }: { route: string }) => {
    return <Text style={styles.headerTitle}>{route}</Text>;
  };

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
          headerTitle: () => <HeaderTitle route="Edit Profile" />,
          headerLeft: () => <HeaderLeftButton />,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="edit-personal-info"
        options={{
          headerTitle: () => <HeaderTitle route="Personal Information" />,
          headerLeft: () => <HeaderLeftButton />,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="edit-education"
        options={{
          headerTitle: () => <HeaderTitle route="Education" />,
          headerLeft: () => <HeaderLeftButton />,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="edit-goals"
        options={{
          headerTitle: () => <HeaderTitle route="Goals and Aspirations" />,
          headerLeft: () => <HeaderLeftButton />,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
      <Stack.Screen
        name="edit-bio"
        options={{
          headerTitle: () => <HeaderTitle route="Bio" />,
          headerLeft: () => <HeaderLeftButton />,
          headerStyle: {
            backgroundColor: theme.colors.background,
          },
          headerShadowVisible: false,
        }}
      />
    </Stack>
  );
}
