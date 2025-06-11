import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;

interface SocialButtonProps extends TouchableOpacityProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  marginBottom?: number;
}

const SocialButton: React.FC<SocialButtonProps> = ({
  title,
  icon,
  iconColor = "#DB4437",
  marginBottom = isSmallScreen ? 8 : 12,
  ...touchableProps
}) => {
  return (
    <TouchableOpacity
      style={[styles.socialButton, { marginBottom }]}
      {...touchableProps}
    >
      <Ionicons name={icon} size={24} color={iconColor} />
      <Text style={styles.socialButtonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  socialButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 50,
    paddingVertical: isSmallScreen ? 10 : 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  socialButtonText: {
    fontSize: isSmallScreen ? 14 : 16,
    fontWeight: "600",
    color: "#374151",
    marginLeft: 12,
  },
});

export default SocialButton;
