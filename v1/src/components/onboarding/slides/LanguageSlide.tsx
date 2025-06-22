"use client";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import type { OnboardingData, Language } from "../../../types/user/user.types";
import { useEffect } from "react";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const languages = [
  {
    code: "english" as Language,
    name: "English",
    nativeName: "English",
    flag: "🇺🇸",
    description: "International language of education",
  },
  {
    code: "french" as Language,
    name: "French",
    nativeName: "Français",
    flag: "🇫🇷",
    description: "Langue internationale de l'éducation",
  },
];

export default function LanguageSlide({
  data,
  updateData,
  isActive,
}: SlideProps) {
  const { theme } = useTheme();
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(30);

  useEffect(() => {
    if (isActive) {
      containerOpacity.value = withSpring(1, { damping: 20, stiffness: 100 });
      containerTranslateY.value = withSpring(0, {
        damping: 20,
        stiffness: 100,
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  const animatedContainerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value,
    transform: [{ translateY: containerTranslateY.value }],
  }));

  const handleLanguageSelect = (language: Language) => {
    updateData("preferredLanguage", language);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "center",
    },
    // Replace the title and subtitle styles in your StyleSheet:
    title: {
      fontSize: 36,
      fontWeight: "900",
      color: theme.colors.text,
      textAlign: "center",
      marginBottom: 8,
      letterSpacing: -1,
      lineHeight: 42,
    },
    subtitle: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 26,
      fontWeight: "500",
      marginBottom: 48,
      paddingHorizontal: 20,
      opacity: 0.9,
      letterSpacing: 0.3,
    },
    languagesContainer: {
      gap: 20,
    },
    languageItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      paddingVertical: 24,
      paddingHorizontal: 24,
      borderRadius: 20,
      borderWidth: 3,
      borderColor: "transparent",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    selectedLanguage: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + "08",
    },
    languageFlag: {
      fontSize: 32,
      marginRight: 20,
    },
    languageContent: {
      flex: 1,
    },
    languageName: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    languageNative: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      fontWeight: "500",
      marginBottom: 6,
    },
    languageDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    selectedText: {
      color: theme.colors.primary,
    },
    checkContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Text style={styles.title}>Choose Your Language</Text>
      <Text style={styles.subtitle}>
        Select your preferred language for the best learning experience with
        AfridemiQ
      </Text>

      <View style={styles.languagesContainer}>
        {languages.map((language) => {
          const isSelected = data.preferredLanguage === language.code;

          return (
            <TouchableOpacity
              key={language.code}
              style={[
                styles.languageItem,
                isSelected && styles.selectedLanguage,
              ]}
              onPress={() => handleLanguageSelect(language.code)}
            >
              <Text style={styles.languageFlag}>{language.flag}</Text>

              <View style={styles.languageContent}>
                <Text
                  style={[
                    styles.languageName,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {language.name}
                </Text>
                <Text style={styles.languageNative}>{language.nativeName}</Text>
                <Text style={styles.languageDescription}>
                  {language.description}
                </Text>
              </View>

              <View style={styles.checkContainer}>
                {isSelected && (
                  <LinearGradient
                    colors={[theme.colors.primary, theme.colors.secondary]}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 16,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Ionicons name="checkmark" size={20} color="white" />
                  </LinearGradient>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}
