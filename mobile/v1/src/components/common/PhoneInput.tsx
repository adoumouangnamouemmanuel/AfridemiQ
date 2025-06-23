import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  Animated,
  Dimensions,
  LayoutRectangle,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { countryCodes } from "./countryCodes"; // We'll create this file with all country codes

interface CountryCode {
  name: string;
  code: string;
  dial_code: string;
  flag: string;
}

interface PhoneInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onChangeCountry?: (country: CountryCode) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  theme: any;
  isDark?: boolean;
  focused?: boolean;
  onFocus?: () => void;
  onBlur?: () => void;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChangeText,
  onChangeCountry,
  placeholder = "Enter number",
  label = "Phone Number",
  error,
  theme,
  isDark = false,
  focused = false,
  onFocus,
  onBlur,
}) => {
  // Default to Cameroon (+237)
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes.find((c) => c.code === "CM") || countryCodes[0]
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const [isFocused, setIsFocused] = useState(focused);
  const [searchQuery, setSearchQuery] = useState("");
  // State for local number (without country code)
  const [localNumber, setLocalNumber] = useState<string>("");

  const countryPickerRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get screen dimensions
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;

  // Update local number when value prop changes
  useEffect(() => {
    if (value && value.startsWith(selectedCountry.dial_code)) {
      setLocalNumber(value.slice(selectedCountry.dial_code.length));
    } else if (value && !value.startsWith(selectedCountry.dial_code)) {
      // If value doesn't match current country code, assume it's a new local number
      setLocalNumber(value);
    } else {
      setLocalNumber("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) onFocus();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) onBlur();
  };

  // Update when country is selected
  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    if (onChangeCountry) onChangeCountry(country);
    // Combine local number with new country code immediately
    onChangeText(
      localNumber ? `${country.dial_code}${localNumber}` : country.dial_code
    );
    hideModal();
  };

  // Filter countries based on search query
  const filteredCountries =
    searchQuery.trim() === ""
      ? countryCodes
      : countryCodes.filter(
          (country) =>
            country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            country.dial_code.includes(searchQuery)
        );

  // Measure the position of the picker to position dropdown
  const measurePickerPosition = () => {
    if (countryPickerRef.current) {
      countryPickerRef.current.measureInWindow((x, y, width, height) => {
        setLayout({ x, y, width, height });
        setModalVisible(true);

        // Start animations when modal opens
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  };

  const hideModal = () => {
    // Animate out before closing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      setSearchQuery("");
    });
  };

  // Determine if dropdown should appear above or below
  const isBottomHalf = layout && layout.y > windowHeight / 2;

  // Calculate dropdown position styles
  const dropdownStyle = {
    position: "absolute" as "absolute",
    left: Math.max(16, Math.min(layout?.x || 0, windowWidth - 280)), // Keep within screen bounds
    width: 280,
    maxWidth: windowWidth - 32, // Stay within margins
    ...(isBottomHalf
      ? { bottom: windowHeight - (layout?.y || 0) + 8 }
      : { top: (layout?.y || 0) + (layout?.height || 0) + 8 }),
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: error ? 4 : 16,
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: 8,
      fontFamily: "Inter-SemiBold",
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
      borderRadius: 50,
      borderWidth: 1,
      borderColor: isFocused
        ? "#3B82F6"
        : error
        ? theme.colors.error
        : theme.colors.border,
      height: 56,
      overflow: "hidden",
    },
    countryPickerContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      borderRightWidth: 1,
      borderRightColor: theme.colors.border,
      height: "100%",
    },
    countryFlag: {
      fontSize: 20,
      marginRight: 4,
    },
    countryCode: {
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Medium",
      marginRight: 4,
    },
    chevronIcon: {
      marginLeft: 2,
    },
    inputWrapper: {
      flex: 1,
      height: "100%",
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
      paddingHorizontal: 16,
      height: "100%",
    },
    errorText: {
      color: theme.colors.error,
      fontSize: 12,
      marginTop: 4,
      marginLeft: 4,
      fontFamily: "Inter-Regular",
    },
    modalOverlay: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor:
        Platform.OS === "ios" ? "transparent" : "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
      backgroundColor: isDark ? "#1F2937" : "white",
      borderRadius: 16,
      maxHeight: 400,
      overflow: "hidden",
      elevation: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: isDark ? 0.3 : 0.15,
      shadowRadius: 12,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: isDark ? "rgba(255,255,255,0.2)" : "#E5E7EB",
      alignSelf: "center",
      marginVertical: 8,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.1)" : "#F3F4F6",
    },
    searchInput: {
      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "#F3F4F6",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: theme.colors.text,
    },
    countryList: {
      padding: 0,
    },
    countryItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
    },
    selectedCountryItem: {
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "#F0F7FF",
    },
    countryFlag2: {
      fontSize: 20,
      marginRight: 12,
    },
    countryInfo: {
      flex: 1,
    },
    countryName: {
      fontSize: 14,
      color: theme.colors.text,
      fontFamily: "Inter-Medium",
    },
    countryDialCode: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontFamily: "Inter-Regular",
    },
    checkIcon: {
      marginLeft: 8,
    },
    emptyResult: {
      padding: 16,
      alignItems: "center",
    },
    emptyResultText: {
      color: theme.colors.textSecondary,
      fontSize: 14,
      fontFamily: "Inter-Regular",
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TouchableOpacity
          ref={countryPickerRef}
          style={styles.countryPickerContainer}
          onPress={measurePickerPosition}
          activeOpacity={0.7}
        >
          <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
          <Text style={styles.countryCode}>{selectedCountry.dial_code}</Text>
          <Ionicons
            name="chevron-down"
            size={16}
            color={theme.colors.textSecondary}
            style={styles.chevronIcon}
          />
        </TouchableOpacity>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textSecondary}
            value={localNumber}
            onChangeText={(text) => {
              setLocalNumber(text);
              onChangeText(`${selectedCountry.dial_code}${text}`);
            }}
            keyboardType="phone-pad"
            onFocus={handleFocus}
            onBlur={handleBlur}
            selectionColor="#3B82F6"
          />
        </View>
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <Pressable style={styles.modalOverlay} onPress={hideModal}>
          {Platform.OS === "ios" ? (
            <BlurView
              intensity={isDark ? 40 : 20}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null}

          <Animated.View
            style={[
              styles.modalContent,
              dropdownStyle,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              },
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.handle}></View>

            <View style={styles.searchContainer}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search country or code"
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>

            <FlatList
              data={filteredCountries}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.countryItem,
                    selectedCountry.code === item.code &&
                      styles.selectedCountryItem,
                  ]}
                  onPress={() => handleCountrySelect(item)}
                >
                  <Text style={styles.countryFlag2}>{item.flag}</Text>
                  <View style={styles.countryInfo}>
                    <Text style={styles.countryName}>{item.name}</Text>
                    <Text style={styles.countryDialCode}>{item.dial_code}</Text>
                  </View>
                  {selectedCountry.code === item.code && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#3B82F6"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.countryList}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={() => (
                <View style={styles.emptyResult}>
                  <Text style={styles.emptyResultText}>No countries found</Text>
                </View>
              )}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};
