import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");
const isSmallScreen = SCREEN_HEIGHT < 700;

interface DividerProps {
  text: string;
  marginVertical?: number;
}

const Divider: React.FC<DividerProps> = ({
  text,
  marginVertical = isSmallScreen ? 8 : 12,
}) => {
  return (
    <View style={[styles.divider, { marginVertical }]}>
      <View style={styles.dividerLine} />
      <Text style={styles.dividerText}>{text}</Text>
      <View style={styles.dividerLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  divider: {
    flexDirection: "row",
    alignItems: "center",
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E5E7EB",
  },
  dividerText: {
    fontSize: isSmallScreen ? 12 : 14,
    color: "#9CA3AF",
    marginHorizontal: 16,
    fontFamily: "Inter-Medium",
    fontWeight: "500",
  },
});

export default Divider;
