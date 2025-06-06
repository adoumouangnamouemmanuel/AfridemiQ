"use client";

import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../utils/ThemeContext";

interface QuestionCardProps {
  question: string;
  options: string[];
  selectedAnswer?: number;
  correctAnswer?: number;
  showResult?: boolean;
  onSelectAnswer: (index: number) => void;
}

export default function QuestionCard({
  question,
  options,
  selectedAnswer,
  correctAnswer,
  showResult = false,
  onSelectAnswer,
}: QuestionCardProps) {
  const { theme } = useTheme();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    selectedAnswer ?? null
  );

  const handleSelectAnswer = (index: number) => {
    if (!showResult) {
      setSelectedIndex(index);
      onSelectAnswer(index);
    }
  };

  const getOptionStyle = (index: number) => {
    if (!showResult) {
      return selectedIndex === index ? styles.selectedOption : styles.option;
    }

    if (index === correctAnswer) {
      return styles.correctOption;
    }

    if (index === selectedIndex && index !== correctAnswer) {
      return styles.incorrectOption;
    }

    return styles.option;
  };

  const getOptionTextStyle = (index: number) => {
    if (!showResult) {
      return selectedIndex === index
        ? styles.selectedOptionText
        : styles.optionText;
    }

    if (index === correctAnswer) {
      return styles.correctOptionText;
    }

    if (index === selectedIndex && index !== correctAnswer) {
      return styles.incorrectOptionText;
    }

    return styles.optionText;
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginVertical: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    question: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.lg,
      lineHeight: 26,
    },
    optionsContainer: {
      gap: theme.spacing.md,
    },
    option: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    selectedOption: {
      backgroundColor: theme.colors.primary + "20",
      borderColor: theme.colors.primary,
      borderWidth: 2,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    correctOption: {
      backgroundColor: theme.colors.success + "20",
      borderColor: theme.colors.success,
      borderWidth: 2,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    incorrectOption: {
      backgroundColor: theme.colors.error + "20",
      borderColor: theme.colors.error,
      borderWidth: 2,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
    },
    optionText: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 22,
    },
    selectedOptionText: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: "600",
      lineHeight: 22,
    },
    correctOptionText: {
      fontSize: 16,
      color: theme.colors.success,
      fontWeight: "600",
      lineHeight: 22,
    },
    incorrectOptionText: {
      fontSize: 16,
      color: theme.colors.error,
      fontWeight: "600",
      lineHeight: 22,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={getOptionStyle(index)}
            onPress={() => handleSelectAnswer(index)}
            disabled={showResult}
          >
            <Text style={getOptionTextStyle(index)}>
              {String.fromCharCode(65 + index)}. {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
