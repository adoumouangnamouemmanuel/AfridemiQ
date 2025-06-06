"use client";

import { useState } from "react";
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
import type { OnboardingData } from "../OnboardingCarousel";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const countries = [
  { name: "Nigeria", flag: "🇳🇬" },
  { name: "Ghana", flag: "🇬🇭" },
  { name: "Kenya", flag: "🇰🇪" },
  { name: "South Africa", flag: "🇿🇦" },
  { name: "Egypt", flag: "🇪🇬" },
  { name: "Morocco", flag: "🇲🇦" },
  { name: "Tanzania", flag: "🇹🇿" },
  { name: "Uganda", flag: "🇺🇬" },
  { name: "Ethiopia", flag: "🇪🇹" },
  { name: "Cameroon", flag: "🇨🇲" },
  { name: "Zimbabwe", flag: "🇿🇼" },
  { name: "Zambia", flag: "🇿🇲" },
  { name: "Senegal", flag: "🇸🇳" },
  { name: "Rwanda", flag: "🇷🇼" },
  { name: "Botswana", flag: "🇧🇼" },
//   { name: "Other", flag: "🌍" },
].sort((a, b) => a.name.localeCompare(b.name));

export default function CountrySlide({
  data,
  updateData,
  isActive,
}: SlideProps) {
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCountryPress = (countryName: string) => {
    // Toggle selection
    if (data.country === countryName) {
      updateData("country", "");
    } else {
      updateData("country", countryName);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#f8fafc",
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.1)",
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
      paddingVertical: 16,
      paddingHorizontal: 20,
      borderRadius: 16,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: "rgba(0,0,0,0.1)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    countryItemDefault: {
      backgroundColor: "#f8fafc",
    },
    selectedCountry: {
      borderColor: theme.colors.primary,
      backgroundColor: "#f8fafc",
    },
    countryFlag: {
      fontSize: 24,
      marginRight: 16,
    },
    countryName: {
      fontSize: 16,
      color: theme.colors.text,
      fontWeight: "600",
      flex: 1,
    },
    selectedText: {
      color: theme.colors.primary,
    },
    checkIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={theme.colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for your country..."
          placeholderTextColor={theme.colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.countriesContainer}>
        <FlatList
          data={filteredCountries}
          keyExtractor={(item) => item.name}
          renderItem={({ item }) => {
            const isSelected = data.country === item.name;
            return (
              <TouchableOpacity
                style={[
                  styles.countryItem,
                  isSelected
                    ? styles.selectedCountry
                    : styles.countryItemDefault,
                ]}
                onPress={() => handleCountryPress(item.name)}
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
                {isSelected && (
                  <View style={styles.checkIcon}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          }}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}
