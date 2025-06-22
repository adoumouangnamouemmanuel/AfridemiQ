import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;

interface CustomInputProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onFocus: () => void;
  onBlur: () => void;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  isPassword?: boolean;
}

const CustomInput: React.FC<CustomInputProps> = ({
  icon,
  focused,
  onFocus,
  onBlur,
  showPassword,
  onTogglePassword,
  isPassword = false,
  ...textInputProps
}) => {
  return (
    <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
      <Ionicons
        name={icon}
        size={22}
        color={focused ? "#3B82F6" : "#9CA3AF"}
        style={styles.inputIcon}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#9CA3AF"
        onFocus={onFocus}
        onBlur={onBlur}
        {...textInputProps}
      />
      {isPassword && (
        <TouchableOpacity style={styles.eyeIcon} onPress={onTogglePassword}>
          <Ionicons
            name={showPassword ? "eye" : "eye-off"}
            size={22}
            color="#9CA3AF"
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    height: isSmallScreen ? 48 : 52,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  inputWrapperFocused: {
    borderColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.15,
  },
  input: {
    flex: 1,
    fontSize: isSmallScreen ? 14 : 16,
    color: "#1F2937",
    paddingVertical: 0,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
  },
  inputIcon: {
    marginRight: 12,
  },
  eyeIcon: {
    padding: 8,
  },
});

export default CustomInput;
