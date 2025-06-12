import { Ionicons } from "@expo/vector-icons";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  LayoutRectangle,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Animated,
} from "react-native";
import { BlurView } from 'expo-blur';

// Define the item type for our picker
interface PickerItem {
  label: string;
  value: string;
}

interface CustomPickerProps {
  items: PickerItem[];
  selectedValue: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  style?: any;
  icon?: string;
  label?: string;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  items,
  selectedValue,
  onValueChange,
  placeholder = "Select",
  style,
  icon = "chevron-down",
  label,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [layout, setLayout] = useState<LayoutRectangle | null>(null);
  const pickerRef = useRef<View>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  const selectedItem = items.find((item) => item.value === selectedValue);
  const displayText = selectedItem ? selectedItem.label : placeholder;

  // Get screen dimensions
  const windowHeight = Dimensions.get("window").height;
  const windowWidth = Dimensions.get("window").width;

  // Measure the position of the picker to position dropdown
  const measurePickerPosition = () => {
    if (pickerRef.current) {
      pickerRef.current.measureInWindow((x, y, width, height) => {
        setLayout({ x, y, width, height });
        setModalVisible(true);
        
        // Start animations when modal opens
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          })
        ]).start();
      });
    }
  };

  const hideModal = () => {
    // Animate out before closing
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start(() => {
      setModalVisible(false);
    });
  };

  // Determine if dropdown should appear above or below
  const isBottomHalf = layout && layout.y > windowHeight / 2;
  
  // Calculate dropdown position styles
  const dropdownStyle = {
    position: "absolute" as "absolute",
    left: Math.max(16, Math.min((layout?.x || 0), windowWidth - (layout?.width || 0) - 16)), // Keep within screen bounds
    width: typeof layout?.width === 'number' ? layout.width : windowWidth * 0.9,
    maxWidth: windowWidth - 32, // Stay within margins
    ...(isBottomHalf
      ? { bottom: windowHeight - (layout?.y || 0) + 8 }
      : { top: (layout?.y || 0) + (layout?.height || 0) + 8 }),
  };

  return (
    <View>
      {label && <Text style={styles.labelText}>{label}</Text>}
      <TouchableOpacity
        ref={pickerRef}
        style={[styles.container, style]}
        onPress={measurePickerPosition}
        activeOpacity={0.7}
      >
        <Text 
          style={[
            styles.pickerText, 
            !selectedItem && styles.placeholderText
          ]}
        >
          {displayText}
        </Text>
        <View style={styles.iconContainer}>
          <Ionicons
            name={icon as any}
            size={18}
            color="#6B7280"
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="none"
        onRequestClose={hideModal}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={hideModal}
        >
          {Platform.OS === 'ios' ? (
            <BlurView 
              intensity={20}
              tint="dark"
              style={StyleSheet.absoluteFill}
            />
          ) : null}
          
          <Animated.View 
            style={[
              styles.modalContent, 
              dropdownStyle,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.handle}></View>
            
            <FlatList
              data={items}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.optionItem,
                    selectedValue === item.value && styles.selectedItem,
                  ]}
                  onPress={() => {
                    onValueChange(item.value);
                    hideModal();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === item.value && styles.selectedText,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {selectedValue === item.value && (
                    <View style={styles.checkmarkContainer}>
                      <Ionicons name="checkmark" size={18} color="white" />
                    </View>
                  )}
                </TouchableOpacity>
              )}
              style={styles.optionsList}
              nestedScrollEnabled
              showsVerticalScrollIndicator={true}
              maxToRenderPerBatch={20}
              contentContainerStyle={styles.listContentContainer}
            />
          </Animated.View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  labelText: {
    fontSize: 14,
    color: "#4B5563",
    fontFamily: "Inter-Medium",
    marginBottom: 6,
    marginLeft: 2,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  pickerText: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "Inter-Regular",
    flex: 1,
  },
  placeholderText: {
    color: "#9CA3AF",
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    maxHeight: 320,
    overflow: "hidden",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E7EB",
    alignSelf: "center",
    marginVertical: 8,
  },
  optionsList: {
    padding: 0,
  },
  listContentContainer: {
    paddingVertical: 8,
  },
  optionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginHorizontal: 8,
    marginVertical: 2,
    borderRadius: 10,
  },
  selectedItem: {
    backgroundColor: "#F0F7FF",
  },
  optionText: {
    fontSize: 16,
    color: "#111827",
    fontFamily: "Inter-Regular",
  },
  selectedText: {
    fontFamily: "Inter-SemiBold",
    color: "#3B82F6",
  },
  checkmarkContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3B82F6",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 2,
  },
});

export default CustomPicker;
