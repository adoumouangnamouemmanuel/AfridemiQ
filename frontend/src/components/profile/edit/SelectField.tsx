import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Pressable,
  Animated,
  Dimensions,
  LayoutRectangle,
  Platform,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: SelectOption[];
  onSelect: (value: string) => void;
  placeholder?: string;
  icon?: string;
  error?: string;
  theme: any;
  isDark?: boolean;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  placeholder = "Select an option",
  icon,
  error,
  theme,
  isDark = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const selectRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get screen dimensions
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;

  // Get selected option label
  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search query
  const filteredOptions =
    searchQuery.trim() === ""
      ? options
      : options.filter((option) =>
          option.label.toLowerCase().includes(searchQuery.toLowerCase())
        );

  // Measure the position of the picker to position dropdown
  const measureSelectPosition = () => {
    if (selectRef.current) {
      selectRef.current.measureInWindow((x, y, width, height) => {
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

  const handleSelect = (selectedValue: string) => {
    onSelect(selectedValue);
    hideModal();
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
    selectContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: isDark ? theme.colors.surface : theme.colors.background,
      borderRadius: 16,
      borderWidth: 2,
      borderColor: modalVisible
        ? "#3B82F6"
        : error
        ? theme.colors.error
        : theme.colors.border,
      paddingHorizontal: 16,
      height: 56,
    },
    icon: {
      marginRight: 12,
    },
    selectText: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      fontFamily: "Inter-Regular",
    },
    placeholderText: {
      color: theme.colors.textSecondary,
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
    optionsList: {
      padding: 0,
    },
    optionItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? "rgba(255,255,255,0.05)" : "#F3F4F6",
    },
    selectedOptionItem: {
      backgroundColor: isDark ? "rgba(59, 130, 246, 0.2)" : "#F0F7FF",
    },
    optionLabel: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
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
      <TouchableOpacity
        ref={selectRef}
        style={styles.selectContainer}
        onPress={measureSelectPosition}
        activeOpacity={0.7}
      >
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={modalVisible ? "#3B82F6" : theme.colors.textSecondary}
            style={styles.icon}
          />
        )}
        <Text
          style={[styles.selectText, !selectedOption && styles.placeholderText]}
        >
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={16}
          color={theme.colors.textSecondary}
        />
      </TouchableOpacity>

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
                placeholder="Search options"
                placeholderTextColor={theme.colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                clearButtonMode="while-editing"
              />
            </View>

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    item.value === value && styles.selectedOptionItem,
                  ]}
                  onPress={() => handleSelect(item.value)}
                >
                  <Text style={styles.optionLabel}>{item.label}</Text>
                  {item.value === value && (
                    <Ionicons
                      name="checkmark"
                      size={18}
                      color="#3B82F6"
                      style={styles.checkIcon}
                    />
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
              showsVerticalScrollIndicator={true}
              ListEmptyComponent={() => (
                <View style={styles.emptyResult}>
                  <Text style={styles.emptyResultText}>No options found</Text>
                </View>
              )}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};
