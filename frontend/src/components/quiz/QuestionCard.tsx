import { Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  interpolate,
} from "react-native-reanimated";

interface QuestionCardProps {
  questionNumber: number;
  questionText: string;
  showFeedback: boolean;
  onHintPress: () => void;
  questionAnimation: any;
  helpButtonAnimation: any;
}

export default function QuestionCard({
  questionNumber,
  questionText,
  showFeedback,
  onHintPress,
  questionAnimation,
  helpButtonAnimation,
}: QuestionCardProps) {
  const questionStyle = useAnimatedStyle(() => ({
    opacity: questionAnimation.value,
    transform: [
      { translateY: interpolate(questionAnimation.value, [0, 1], [30, 0]) },
      { scale: interpolate(questionAnimation.value, [0, 1], [0.95, 1]) },
    ],
  }));

  const helpButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: helpButtonAnimation.value }],
  }));

  return (
    <Animated.View style={[styles.questionCard, questionStyle]}>
      <Text style={styles.questionNumber}>Question {questionNumber}</Text>
      <Text style={styles.questionText}>{questionText}</Text>

      {!showFeedback && (
        <Animated.View style={[styles.hintButton, helpButtonStyle]}>
          <TouchableOpacity onPress={onHintPress} activeOpacity={0.8}>
            <Ionicons name="help" size={20} color="white" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  questionCard: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 28,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  questionNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6366F1",
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  questionText: {
    fontSize: 22,
    fontWeight: "600",
    color: "#1F2937",
    lineHeight: 32,
  },
  hintButton: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
});