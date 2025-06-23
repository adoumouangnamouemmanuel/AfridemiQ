import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface ExplanationModalProps {
  visible: boolean;
  question: any;
  onClose: () => void;
}

export default function ExplanationModal({
  visible,
  question,
  onClose,
}: ExplanationModalProps) {
  if (!question) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Complete Solution</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            style={styles.scrollView}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Question Analysis</Text>
              <Text style={styles.text}>
                {question.explanation ||
                  "This question tests your understanding of fundamental concepts. Let's break down the solution step by step."}
              </Text>
            </View>

            <View style={styles.answerBox}>
              <Text style={styles.answerTitle}>✅ Correct Answer</Text>
              <Text style={styles.answerText}>
                Option {String.fromCharCode(65 + question.correctAnswer)}:{" "}
                {question.options[question.correctAnswer]}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Step-by-Step Solution</Text>

              {[
                "Carefully read the question and identify what information is given and what you need to find.",
                "Determine which concept, formula, or method is most appropriate for solving this type of problem.",
                "Apply the chosen method systematically, showing each step of your calculation or reasoning.",
                "Verify your answer by checking if it makes sense in the context of the original question.",
              ].map((step, index) => (
                <View key={index} style={styles.stepContainer}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>💡 Key Takeaway</Text>
              <Text style={styles.text}>
                Remember this approach for similar questions. Practice
                identifying the key information and choosing the right method to
                solve the problem efficiently.
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 24,
    padding: 24,
    width: SCREEN_WIDTH - 20,
    maxHeight: SCREEN_HEIGHT * 0.9,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  answerBox: {
    backgroundColor: "#ECFDF5",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#10B981",
  },
  answerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#10B981",
    marginBottom: 8,
  },
  answerText: {
    fontSize: 16,
    color: "#374151",
  },
  stepContainer: {
    flexDirection: "row",
    marginBottom: 16,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: "700",
    color: "white",
  },
  stepText: {
    fontSize: 16,
    color: "#374151",
    flex: 1,
    lineHeight: 24,
  },
});