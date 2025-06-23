"use client";

import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import type { OnboardingData, Country } from "../../../types/user/user.types";
import { useCommonOnboarding } from "../../../styles/commonOnboarding";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const countries = [
  { code: "nigeria" as Country, name: "Nigeria", flag: "🇳🇬" },
  { code: "ghana" as Country, name: "Ghana", flag: "🇬🇭" },
  { code: "kenya" as Country, name: "Kenya", flag: "🇰🇪" },
  { code: "cameroon" as Country, name: "Cameroon", flag: "🇨🇲" },
  { code: "senegal" as Country, name: "Senegal", flag: "🇸🇳" },
  { code: "chad" as Country, name: "Chad", flag: "🇹🇩" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function CountrySlide({
  data,
  updateData,
  isActive,
}: SlideProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const containerOpacity = useSharedValue(0);
  const containerTranslateY = useSharedValue(30);
  const commonStyles = useCommonOnboarding();

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

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountryPress = (countryCode: Country) => {
    updateData("country", countryCode);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: 50,
      paddingHorizontal: 20,
      paddingVertical: 5,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: theme.colors.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    searchIcon: {
      marginRight: 12,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "500",
    },
    countriesContainer: {
      flex: 1,
    },
    countryItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    selectedCountry: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.background,
    },
    countryFlag: {
      fontSize: 28,
      marginRight: 16,
    },
    countryName: {
      fontSize: 18,
      color: theme.colors.text,
      fontWeight: "600",
      flex: 1,
    },
    selectedText: {
      color: theme.colors.primary,
    },
    checkContainer: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <Animated.View style={[styles.container, animatedContainerStyle]}>
      <Text style={commonStyles.title}>Select Your Country</Text>
      <Text style={commonStyles.subtitle}>
        Help us customize your learning experience
      </Text>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search countries..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.countriesContainer}>
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isSelected = data.country === item.code;
            return (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  isSelected && styles.selectedCountry,
                ]}
                onPress={() => handleCountryPress(item.code)}
              >
                <Text style={styles.countryFlag}>{item.flag}</Text>
                <Text
                  style={[
                    styles.countryName,
                    isSelected && styles.selectedText,
                  ]}
                >
                  {item.name}
                </Text>
                <View style={styles.checkContainer}>
                  {isSelected && (
                    <LinearGradient
                      colors={[theme.colors.primary, theme.colors.secondary]}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons name="checkmark" size={16} color="white" />
                    </LinearGradient>
                  )}
                </View>
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </Animated.View>
  );
}
