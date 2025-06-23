import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;

interface CustomButtonProps extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  loadingText?: string;
  marginTop?: number;
  marginBottom?: number;
  style?: any;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  title,
  isLoading = false,
  loadingText = "Loading...",
  marginTop = 0,
  marginBottom = isSmallScreen ? 8 : 12,
  disabled,
  style,
  ...touchableProps
}) => {
  const buttonStyle = [styles.button, { marginTop, marginBottom }, style];

  return (
    <TouchableOpacity
      disabled={disabled || isLoading}
      style={[
        (disabled || isLoading) && styles.buttonDisabled,
        { marginTop, marginBottom },
      ]}
      {...touchableProps}
    >
      <LinearGradient
        colors={
          style?.backgroundColor
            ? [style.backgroundColor, style.backgroundColor]
            : ["#3B82F6", "#1D4ED8", "#1E40AF"]
        }
        style={buttonStyle}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.loadingText}>{loadingText}</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    paddingVertical: isSmallScreen ? 12 : 14,
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "white",
    fontSize: isSmallScreen ? 16 : 18,
    fontFamily: "Inter-Bold",
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "white",
    fontSize: isSmallScreen ? 14 : 16,
    fontFamily: "Inter-SemiBold",
    fontWeight: "600",
    marginLeft: 8,
  },
});

export default CustomButton;
