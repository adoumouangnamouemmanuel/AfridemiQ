"use client";

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../../../utils/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { OnboardingData } from "../OnboardingCarousel";

import type { ColorValue } from "react-native";

interface SlideProps {
  data: OnboardingData;
  updateData: (field: keyof OnboardingData, value: any) => void;
  isActive: boolean;
}

const learningStyles: {
  id: string;
  name: string;
  description: string;
  icon: string;
  gradient: [ColorValue, ColorValue];
}[] = [
  {
    id: "visual",
    name: "Visual Learner",
    description: "Learn through images, diagrams, and charts",
    icon: "eye",
    gradient: ["#3b82f6", "#1d4ed8"],
  },
  {
    id: "auditory",
    name: "Auditory Learner",
    description: "Learn through listening and discussion",
    icon: "volume-high",
    gradient: ["#10b981", "#059669"],
  },
  {
    id: "kinesthetic",
    name: "Kinesthetic Learner",
    description: "Learn through hands-on activities",
    icon: "hand-left",
    gradient: ["#f59e0b", "#d97706"],
  },
  {
    id: "reading",
    name: "Reading/Writing",
    description: "Learn through reading and taking notes",
    icon: "document-text",
    gradient: ["#8b5cf6", "#7c3aed"],
  },
];

export default function LearningStyleSlide({
  data,
  updateData,
  isActive,
}: SlideProps) {
  const { theme } = useTheme();

  const handleStylePress = (styleId: string) => {
    // Toggle selection
    if (data.learningStyle === styleId) {
      updateData("learningStyle", "");
    } else {
      updateData("learningStyle", styleId);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: 24,
    },
    header: {
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    stylesContainer: {
      flex: 1,
    },
    styleItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 20,
      paddingHorizontal: 20,
      backgroundColor: theme.colors.background,
      borderRadius: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: "rgba(0,0,0,0.1)",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 4,
    },
    selectedStyle: {
      borderColor: theme.colors.primary,
    //   backgroundColor: theme.colors.primary + "08",
    },
    styleIconContainer: {
      width: 60,
      height: 60,
      borderRadius: 30,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 16,
    },
    styleInfo: {
      flex: 1,
    },
    styleName: {
      fontSize: 18,
      fontWeight: "700",
      color: theme.colors.text,
      marginBottom: 4,
    },
    styleDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    selectedText: {
      color: theme.colors.primary,
    },
    checkIcon: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: theme.colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },
  });

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>How do you learn best?</Text>
        <Text style={styles.subtitle}>
          Understanding your learning style helps us recommend the most
          effective study materials for you.
        </Text>
      </View> */}

      <ScrollView
        style={styles.stylesContainer}
        showsVerticalScrollIndicator={true}
      >
        {learningStyles.map((style) => (
          <TouchableOpacity
            key={style.id}
            style={[
              styles.styleItem,
              data.learningStyle === style.id && styles.selectedStyle,
            ]}
            onPress={() => handleStylePress(style.id)}
          >
            <LinearGradient
              colors={style.gradient}
              style={styles.styleIconContainer}
            >
              <Ionicons name={style.icon as any} size={30} color="white" />
            </LinearGradient>
            <View style={styles.styleInfo}>
              <Text
                style={[
                  styles.styleName,
                  data.learningStyle === style.id && styles.selectedText,
                ]}
              >
                {style.name}
              </Text>
              <Text style={styles.styleDescription}>{style.description}</Text>
            </View>
            {data.learningStyle === style.id && (
              <View style={styles.checkIcon}>
                <Ionicons name="checkmark" size={18} color="white" />
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}
