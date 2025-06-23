import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface HintModalProps {
  visible: boolean;
  currentHint: string;
  hintStep: number;
  totalHints: number;
  onNextHint: () => void;
  onClose: () => void;
  isLastHint: boolean;
}

export default function HintModal({
  visible,
  currentHint,
  hintStep,
  totalHints,
  onNextHint,
  onClose,
  isLastHint,
}: HintModalProps) {
  const getXPPenalty = () => {
    if (hintStep === 0) return 2;
    if (hintStep === 1) return 2;
    if (hintStep === 2) return 3;
    return 0;
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Ionicons name="bulb" size={48} color="#8B5CF6" />
            <Text style={styles.modalTitle}>
              Hint {hintStep + 1} of {totalHints}
            </Text>
            <Text style={styles.modalSubtitle}>
              {isLastHint
                ? "⚠️ This will reveal the answer!"
                : "Getting closer to the solution..."}
            </Text>
          </View>

          <View style={styles.hintContent}>
            <Text style={styles.hintText}>{currentHint}</Text>
          </View>

          <View style={styles.hintInfo}>
            {!isLastHint && (
              <Text style={styles.xpPenalty}>
                XP Penalty: -{getXPPenalty()} points
              </Text>
            )}
            {isLastHint && (
              <Text style={styles.heartPenalty}>❤️ You&apos;ll lose 1 heart!</Text>
            )}
          </View>

          <View style={styles.buttonContainer}>
            {!isLastHint ? (
              <TouchableOpacity
                style={styles.nextHintButton}
                onPress={onNextHint}
              >
                <Text style={styles.buttonText}>
                  Next Hint (-{getXPPenalty()} XP)
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.revealButton}
                onPress={onNextHint}
              >
                <Text style={styles.buttonText}>Reveal Answer (-1 ❤️)</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
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
    width: SCREEN_WIDTH - 40,
    maxWidth: 400,
  },
  modalHeader: {
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 12,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
  },
  hintContent: {
    backgroundColor: "#F8FAFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#8B5CF6",
  },
  hintText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  hintInfo: {
    alignItems: "center",
    marginBottom: 20,
  },
  xpPenalty: {
    fontSize: 14,
    color: "#D97706",
    fontWeight: "600",
  },
  heartPenalty: {
    fontSize: 14,
    color: "#EF4444",
    fontWeight: "600",
    marginTop: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  nextHintButton: {
    backgroundColor: "#8B5CF6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  revealButton: {
    backgroundColor: "#EF4444",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  closeButtonText: {
    color: "#6B7280",
    fontWeight: "600",
    fontSize: 16,
  },
});
