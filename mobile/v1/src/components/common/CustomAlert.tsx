import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated as RNAnimated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type AlertType = "success" | "error" | "warning" | "info";

interface CustomAlertProps {
  visible: boolean;
  type: AlertType;
  message: string;
  duration?: number;
  onClose: () => void;
  theme: any;
  isDark?: boolean;
}

export const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  type,
  message,
  duration = 3000,
  onClose,
  theme,
  isDark = false,
}) => {
  const [animation] = useState(new RNAnimated.Value(0));
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      RNAnimated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hideAlert();
      }, duration);

      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const hideAlert = () => {
    RNAnimated.timing(animation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
      onClose();
    });
  };

  if (!isVisible) return null;

  const getAlertConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: "checkmark-circle",
          color: "#FFFFFF",
          backgroundColor: isDark ? "#10B981" : "#059669",
          borderColor: isDark ? "#065F46" : "#047857",
        };
      case "error":
        return {
          icon: "close-circle",
          color: "#FFFFFF",
          backgroundColor: isDark ? "#EF4444" : "#DC2626",
          borderColor: isDark ? "#B91C1C" : "#991B1B",
        };
      case "warning":
        return {
          icon: "warning",
          color: "#FFFFFF",
          backgroundColor: isDark ? "#F59E0B" : "#D97706",
          borderColor: isDark ? "#B45309" : "#92400E",
        };
      case "info":
      default:
        return {
          icon: "information-circle",
          color: "#FFFFFF",
          backgroundColor: isDark ? "#3B82F6" : "#2563EB",
          borderColor: isDark ? "#1D4ED8" : "#1E40AF",
        };
    }
  };

  const config = getAlertConfig();

  const styles = StyleSheet.create({
    container: {
      position: "absolute",
      top: 20,
      left: 20,
      right: 20,
      backgroundColor: config.backgroundColor,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: config.borderColor,
      padding: 16,
      flexDirection: "row",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.25 : 0.1,
      shadowRadius: 8,
      elevation: 5,
      zIndex: 1000,
    },
    iconContainer: {
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    message: {
      fontSize: 15,
      color: config.color,
      fontFamily: "Inter-Medium",
    },
    closeButton: {
      marginLeft: 12,
    },
  });

  return (
    <RNAnimated.View
      style={[
        styles.container,
        {
          opacity: animation,
          transform: [
            {
              translateY: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [-20, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon as any} size={24} color={config.color} />
      </View>
      <View style={styles.content}>
        <Text style={styles.message}>{message}</Text>
      </View>
      <TouchableOpacity style={styles.closeButton} onPress={hideAlert}>
        <Ionicons name="close" size={20} color={config.color} />
      </TouchableOpacity>
    </RNAnimated.View>
  );
};
