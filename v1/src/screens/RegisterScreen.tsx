"use client";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
  CustomButton,
  CustomInput,
  CustomPicker,
  Divider,
  Loader,
  SocialButton,
} from "../components/common";
import { apiService } from "../services/api.service";
import { authService } from "../services/auth.service";
import { useUser } from "../utils/UserContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Dynamic sizing based on screen height
const isSmallScreen = SCREEN_HEIGHT < 700;
const isMediumScreen = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850;

export default function RegisterScreen() {
  const { setUser, setToken } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Form data with additional fields for step 2
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    gender: "Male",
    dateOfBirth: new Date(2000, 0, 1),
    role: "Student",
    preferredLanguage: "English",
    password: "",
    confirmPassword: "",
  });

  // Date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);

  // UI state management
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Focus states for form inputs
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [stepError, setStepError] = useState("");

  // Animation values
  const slideUp = useSharedValue(100);
  const fadeIn = useSharedValue(0);
  const scaleIn = useSharedValue(0.8);
  const stepSlide = useSharedValue(0);

  // Initialize animations on component mount
  React.useEffect(() => {
    slideUp.value = withDelay(300, withSpring(0, { damping: 20 }));
    fadeIn.value = withDelay(200, withSpring(1));
    scaleIn.value = withDelay(400, withSpring(1, { damping: 15 }));

    // Keyboard event listeners
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, [fadeIn, scaleIn, slideUp]);

  // Animation styles
  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: scaleIn.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  const step1AnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(stepSlide.value * -SCREEN_WIDTH, {
          duration: 300,
        }),
      },
    ],
    opacity: withTiming(currentStep === 1 ? 1 : 0, { duration: 300 }),
  }));

  const step2AnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(
          currentStep === 1
            ? SCREEN_WIDTH
            : currentStep === 3
            ? -SCREEN_WIDTH
            : 0,
          {
            duration: 300,
          }
        ),
      },
    ],
    opacity: withTiming(currentStep === 2 ? 1 : 0, { duration: 300 }),
  }));

  const step3AnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(currentStep < 3 ? SCREEN_WIDTH : 0, {
          duration: 300,
        }),
      },
    ],
    opacity: withTiming(currentStep === 3 ? 1 : 0, { duration: 300 }),
  }));

  // Validation functions
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (password.length === 0) return null;

    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 2) return { text: "Weak", color: "#ef4444" };
    if (score < 4) return { text: "Good", color: "#f59e0b" };
    return { text: "Strong", color: "#10b981" };
  };

  const passwordsMatch =
    formData.password === formData.confirmPassword &&
    formData.confirmPassword.length > 0;
  const passwordStrength = getPasswordStrength();

  // Step 1 validation (name and email)
  const validateStep1 = async () => {
    setStepError("");

    if (!formData.firstName.trim()) {
      setStepError("Please enter your first name");
      return false;
    }

    if (!formData.lastName.trim()) {
      setStepError("Please enter your last name");
      return false;
    }

    if (!formData.email.trim()) {
      setStepError("Please enter your email");
      return false;
    }

    if (!validateEmail(formData.email)) {
      setStepError("Please enter a valid email address");
      return false;
    }

    return true;
  };

  // Step 2 validation (profile details)
  const validateStep2 = () => {
    setStepError("");

    // All fields in step 2 have default values, so basic validation is sufficient
    if (!formData.gender) {
      setStepError("Please select your gender");
      return false;
    }

    if (!formData.dateOfBirth) {
      setStepError("Please select your date of birth");
      return false;
    }

    if (!formData.role) {
      setStepError("Please select your role");
      return false;
    }

    if (!formData.preferredLanguage) {
      setStepError("Please select your language");
      return false;
    }

    return true;
  };

  // Step 3 validation (passwords)
  const validateStep3 = () => {
    setStepError("");

    if (!formData.password) {
      setStepError("Please enter a password");
      return false;
    }

    if (formData.password.length < 8) {
      setStepError("Password must be at least 8 characters long");
      return false;
    }

    if (!formData.confirmPassword) {
      setStepError("Please confirm your password");
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setStepError("Passwords do not match");
      return false;
    }

    return true;
  };

  // Handle step navigation
  const handleContinue = async () => {
    if (currentStep === 1) {
      const isValid = await validateStep1();
      if (isValid) {
        setCurrentStep(2);
        stepSlide.value = 1;
      }
    } else if (currentStep === 2) {
      const isValid = validateStep2();
      if (isValid) {
        setCurrentStep(3);
        stepSlide.value = 2;
      }
    }
  };

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
      stepSlide.value = 0;
    } else if (currentStep === 3) {
      setCurrentStep(2);
      stepSlide.value = 1;
    }
    setStepError("");
  };

  // Handle date change
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData((prev) => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle user registration
  const handleRegister = async () => {
    if (!validateStep3()) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Prepare registration data by combining first and last name
      const { firstName, lastName, confirmPassword, ...otherData } = formData;
      const registrationData = {
        ...otherData,
        name: `${firstName.trim()} ${lastName.trim()}`, // Concatenate names for backend
      };

      // Call registration API
      const response = await apiService.register(registrationData);

      // Transform user data to frontend format
      const userData = authService.transformUserData(response.user);

      // Store authentication data
      await authService.storeAuthData(
        userData,
        response.token,
        response.refreshToken
      );

      // Update context
      setUser(userData);
      setToken(response.token);

      setIsLoading(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      setErrorMessage(
        error instanceof Error ? error.message : "Registration failed"
      );
      setShowError(true);
    }
  };

  // Handle successful registration
  const handleSuccessHide = () => {
    setShowSuccess(false);
    router.replace("/auth/onboarding");
  };

  // Handle registration error
  const handleErrorHide = () => {
    setShowError(false);
    setErrorMessage("");
  };

  // Placeholder for Google registration
  const handleGoogleRegister = () => {
    Alert.alert("Google Sign Up", "Google authentication coming soon!");
  };

  // Update form data and clear errors
  const updateFormData = (field: string, value: string | Date) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (stepError) setStepError("");
  };

  // Form validation states
  const isStep1Valid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "";

  const isStep2Valid = true; // All fields have default values

  const isStep3Valid =
    formData.password.trim() !== "" && formData.confirmPassword.trim() !== "";

  // Your existing styles remain unchanged
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFF",
    },
    gradient: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: isSmallScreen ? 20 : 24,
      paddingVertical: isSmallScreen ? 10 : 20,
    },
    staticBottom: {
      paddingBottom: Platform.OS === "ios" ? 20 : 16,
      paddingHorizontal: isSmallScreen ? 20 : 28,
    },
    topSection: {
      flex: keyboardVisible
        ? isSmallScreen
          ? 0.2
          : 0.25
        : isSmallScreen
        ? 0.3
        : isMediumScreen
        ? 0.35
        : 0.4,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: isSmallScreen ? 10 : 20,
      marginBottom: keyboardVisible ? 10 : isSmallScreen ? 15 : 20,
    },
    imageContainer: {
      width: SCREEN_WIDTH * (isSmallScreen ? 0.4 : 0.5),
      height: SCREEN_HEIGHT * (isSmallScreen ? 0.12 : 0.15),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: isSmallScreen ? 8 : 12,
    },
    signUpImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    welcomeText: {
      fontSize: isSmallScreen ? 20 : 24,
      fontWeight: "700",
      fontFamily: "Poppins-Bold",
      color: "#1a1a1a",
      textAlign: "center",
      marginBottom: isSmallScreen ? 4 : 6,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: isSmallScreen ? 11 : 13,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      fontWeight: "400",
      textAlign: "center",
      lineHeight: isSmallScreen ? 14 : 18,
    },
    bottomSection: {
      flex: keyboardVisible
        ? isSmallScreen
          ? 0.8
          : 0.75
        : isSmallScreen
        ? 0.7
        : isMediumScreen
        ? 0.65
        : 0.6,
      justifyContent: "center",
      paddingTop: keyboardVisible
        ? isSmallScreen
          ? 10
          : 15
        : isSmallScreen
        ? 5
        : 10,
      paddingBottom: 0,
    },
    form: {
      marginBottom: isSmallScreen ? 8 : 12,
    },
    inputContainer: {
      marginBottom: isSmallScreen ? 12 : 16,
    },
    nameInputRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: isSmallScreen ? 12 : 16,
    },
    halfWidthInput: {
      flex: 1,
    },
    inputSpacer: {
      width: 12,
    },
    passwordStrength: {
      marginTop: 6,
      alignItems: "flex-end",
    },
    strengthText: {
      fontSize: isSmallScreen ? 11 : 13,
      fontFamily: "Inter-Medium",
      fontWeight: "500",
    },
    registerButton: {
      borderRadius: 50,
      paddingVertical: isSmallScreen ? 12 : 14,
      alignItems: "center",
      marginTop: isSmallScreen ? 15 : 20,
      marginBottom: isSmallScreen ? 8 : 12,
      shadowColor: "#3B82F6",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    registerButtonDisabled: {
      opacity: 0.7,
    },
    registerButtonText: {
      color: "white",
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: isSmallScreen ? 8 : 12,
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
      fontWeight: "500",
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
      borderRadius: 50,
      paddingVertical: isSmallScreen ? 10 : 12,
      marginBottom: isSmallScreen ? 8 : 12,
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
    googleButtonText: {
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: "600",
      color: "#374151",
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 8,
    },
    footerText: {
      fontSize: isSmallScreen ? 13 : 15,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      fontWeight: "400",
    },
    loginLink: {
      fontSize: isSmallScreen ? 13 : 15,
      color: "#3B82F6",
      fontFamily: "Inter-SemiBold",
      fontWeight: "600",
      marginLeft: 4,
    },
    loadingContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
    },
    loadingText: {
      color: "white",
      fontSize: isSmallScreen ? 14 : 16,
      fontWeight: "600",
      marginLeft: 8,
    },
    stepsContainer: {
      flex: 1,
      position: "relative",
      overflow: "hidden",
    },
    stepContent: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: "center",
    },
    step2Content: {
      flex: 1,
      justifyContent: "space-between",
      paddingVertical: isSmallScreen ? 20 : 30,
    },
    step2FormContainer: {
      flex: 1,
      justifyContent: "center",
    },
    stepIndicator: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      marginTop: isSmallScreen ? 12 : 16,
      marginBottom: isSmallScreen ? 8 : 12,
      paddingHorizontal: 20,
    },
    stepContainer: {
      alignItems: "center",
      flex: 1,
      maxWidth: 80,
    },
    stepDot: {
      width: isSmallScreen ? 18 : 20,
      height: isSmallScreen ? 18 : 20,
      borderRadius: isSmallScreen ? 9 : 10,
      backgroundColor: "#F3F4F6",
      borderWidth: 3,
      borderColor: "#E5E7EB",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    stepDotActive: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
      shadowColor: "#3B82F6",
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.4,
      shadowRadius: 8,
      elevation: 8,
    },
    stepDotCompleted: {
      backgroundColor: "#10B981",
      borderColor: "#10B981",
    },
    stepDotInner: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "white",
    },
    stepCheckmark: {
      position: "absolute",
    },
    stepLine: {
      height: 4,
      backgroundColor: "#E5E7EB",
      marginHorizontal: 8,
      borderRadius: 2,
      flex: 1,
      maxWidth: 60,
      position: "relative",
      overflow: "hidden",
    },
    stepLineActive: {
      backgroundColor: "#3B82F6",
    },
    stepLineProgress: {
      position: "absolute",
      top: 0,
      left: 0,
      bottom: 0,
      backgroundColor: "#3B82F6",
      borderRadius: 2,
    },
    stepLabel: {
      marginTop: 8,
      fontSize: isSmallScreen ? 10 : 11,
      fontFamily: "Inter-SemiBold",
      fontWeight: "600",
      color: "#9CA3AF",
      textAlign: "center",
      letterSpacing: 0.5,
    },
    stepLabelActive: {
      color: "#3B82F6",
    },
    stepLabelCompleted: {
      color: "#10B981",
    },
    stepNumber: {
      fontSize: isSmallScreen ? 10 : 11,
      fontFamily: "Inter-Bold",
      fontWeight: "700",
      color: "#6B7280",
    },
    stepNumberActive: {
      color: "white",
    },
    passwordMatch: {
      marginTop: 6,
      alignItems: "flex-end",
      paddingHorizontal: 4,
    },
    matchText: {
      fontSize: isSmallScreen ? 11 : 13,
      fontFamily: "Inter-Medium",
      fontWeight: "500",
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "stretch",
      marginTop: isSmallScreen ? 30 : 40,
      gap: 16,
    },
    baseButton: {
      borderRadius: 50,
      paddingVertical: isSmallScreen ? 8 : 8,
      paddingHorizontal: isSmallScreen ? 20 : 24,
      minHeight: isSmallScreen ? 50 : 54,
      justifyContent: "center",
      alignItems: "center",
      flexDirection: "row",
    },
    backButton: {
      flex: 1,
      backgroundColor: "#F8FAFF",
      borderWidth: 2,
      borderColor: "#E5E7EB",
      marginRight: 8,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    createButton: {
      flex: 2,
      backgroundColor: "#3B82F6",
      marginLeft: 8,
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
      opacity: 0.6,
    },
    backButtonText: {
      fontSize: isSmallScreen ? 15 : 16,
      fontWeight: "600",
      color: "#374151",
      fontFamily: "Inter-SemiBold",
    },
    createButtonText: {
      fontSize: isSmallScreen ? 15 : 16,
      fontWeight: "700",
      color: "white",
      fontFamily: "Inter-Bold",
      marginLeft: isLoading ? 8 : 0,
    },
    errorText: {
      color: "#ef4444",
      fontSize: isSmallScreen ? 12 : 14,
      fontFamily: "Inter-Medium",
      textAlign: "center",
      marginTop: 8,
      marginBottom: 8,
      paddingHorizontal: 16,
      lineHeight: isSmallScreen ? 16 : 20,
    },
    // New styles for step 2
    selectContainer: {
      backgroundColor: "#F9FAFB",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 12,
      marginBottom: isSmallScreen ? 8 : 10,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    selectLabel: {
      fontSize: isSmallScreen ? 12 : 14,
      fontWeight: "500",
      color: "#4B5563",
      marginBottom: 6,
      paddingHorizontal: 4,
      fontFamily: "Inter-Medium",
    },
    picker: {
      height: 50,
      backgroundColor: "transparent",
    },
    pickerItem: {
      fontSize: isSmallScreen ? 14 : 16,
      fontFamily: "Inter-Regular",
    },
    datePickerButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#F9FAFB",
      borderWidth: 1,
      borderColor: "#E5E7EB",
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      marginBottom: isSmallScreen ? 12 : 16,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 1,
      },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    dateText: {
      fontSize: isSmallScreen ? 14 : 16,
      color: "#111827",
      fontFamily: "Inter-Regular",
    },
    calendarIcon: {
      color: "#6B7280",
    },
    selectRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: isSmallScreen ? 12 : 16,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#F8FAFF", "#EEF2FF", "#E0E7FF"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <KeyboardAvoidingView
            style={styles.keyboardView}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={styles.topSection}>
              {!keyboardVisible && (
                <Animated.View
                  style={[styles.imageContainer, imageAnimatedStyle]}
                >
                  <Image
                    source={require("../assets/sign-in/signup.png")}
                    style={styles.signUpImage}
                  />
                </Animated.View>
              )}
              <Animated.View style={imageAnimatedStyle}>
                <Text style={styles.welcomeText}>Create Account</Text>
                <Text style={styles.subtitle}>
                  {currentStep === 1
                    ? "Join thousands of students preparing for success"
                    : currentStep === 2
                    ? "Tell us a bit more about yourself"
                    : "Secure your account with a strong password"}
                </Text>
              </Animated.View>

              {/* Step Indicator - Updated for 3 steps */}
              <View style={styles.stepIndicator}>
                {/* Step 1 */}
                <View style={styles.stepContainer}>
                  <View
                    style={[
                      styles.stepDot,
                      currentStep >= 1 && styles.stepDotActive,
                      currentStep > 1 && styles.stepDotCompleted,
                    ]}
                  >
                    {currentStep > 1 ? (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="white"
                        style={styles.stepCheckmark}
                      />
                    ) : currentStep === 1 ? (
                      <View style={styles.stepDotInner} />
                    ) : (
                      <Text style={[styles.stepNumber]}>1</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      currentStep >= 1 && styles.stepLabelActive,
                      currentStep > 1 && styles.stepLabelCompleted,
                    ]}
                  >
                    Personal Info
                  </Text>
                </View>

                {/* Line between Step 1 and 2 */}
                <View style={styles.stepLine}>
                  <Animated.View
                    style={[
                      styles.stepLineProgress,
                      {
                        width: currentStep >= 2 ? "100%" : "0%",
                      },
                    ]}
                  />
                </View>

                {/* Step 2 */}
                <View style={styles.stepContainer}>
                  <View
                    style={[
                      styles.stepDot,
                      currentStep >= 2 && styles.stepDotActive,
                      currentStep > 2 && styles.stepDotCompleted,
                    ]}
                  >
                    {currentStep > 2 ? (
                      <Ionicons
                        name="checkmark"
                        size={12}
                        color="white"
                        style={styles.stepCheckmark}
                      />
                    ) : currentStep === 2 ? (
                      <View style={styles.stepDotInner} />
                    ) : (
                      <Text style={[styles.stepNumber]}>2</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      currentStep >= 2 && styles.stepLabelActive,
                      currentStep > 2 && styles.stepLabelCompleted,
                    ]}
                  >
                    Profile
                  </Text>
                </View>

                {/* Line between Step 2 and 3 */}
                <View style={styles.stepLine}>
                  <Animated.View
                    style={[
                      styles.stepLineProgress,
                      {
                        width: currentStep >= 3 ? "100%" : "0%",
                      },
                    ]}
                  />
                </View>

                {/* Step 3 */}
                <View style={styles.stepContainer}>
                  <View
                    style={[
                      styles.stepDot,
                      currentStep >= 3 && styles.stepDotActive,
                    ]}
                  >
                    {currentStep === 3 ? (
                      <View style={styles.stepDotInner} />
                    ) : (
                      <Text style={[styles.stepNumber]}>3</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      currentStep >= 3 && styles.stepLabelActive,
                    ]}
                  >
                    Security
                  </Text>
                </View>
              </View>
            </View>

            <Animated.View style={[styles.bottomSection, formAnimatedStyle]}>
              <View style={styles.stepsContainer}>
                {/* Step 1: Name and Email */}
                <Animated.View style={[styles.stepContent, step1AnimatedStyle]}>
                  <View style={styles.form}>
                    {/* First and Last Name Row */}
                    <View style={styles.nameInputRow}>
                      <View style={styles.halfWidthInput}>
                        <CustomInput
                          icon="person"
                          placeholder="First name"
                          value={formData.firstName}
                          onChangeText={(text) =>
                            updateFormData("firstName", text)
                          }
                          autoCapitalize="words"
                          autoCorrect={false}
                          focused={firstNameFocused}
                          onFocus={() => setFirstNameFocused(true)}
                          onBlur={() => setFirstNameFocused(false)}
                        />
                      </View>

                      <View style={styles.inputSpacer} />

                      <View style={styles.halfWidthInput}>
                        <CustomInput
                          icon="person-outline"
                          placeholder="Last name"
                          value={formData.lastName}
                          onChangeText={(text) =>
                            updateFormData("lastName", text)
                          }
                          autoCapitalize="words"
                          autoCorrect={false}
                          focused={lastNameFocused}
                          onFocus={() => setLastNameFocused(true)}
                          onBlur={() => setLastNameFocused(false)}
                        />
                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <CustomInput
                        icon="mail"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChangeText={(text) => updateFormData("email", text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        focused={emailFocused}
                        onFocus={() => setEmailFocused(true)}
                        onBlur={() => setEmailFocused(false)}
                      />
                    </View>

                    {stepError && currentStep === 1 && (
                      <Text style={styles.errorText}>{stepError}</Text>
                    )}

                    <CustomButton
                      title="Continue"
                      onPress={handleContinue}
                      disabled={isLoading || !isStep1Valid}
                      isLoading={false}
                      marginTop={isSmallScreen ? 15 : 20}
                    />
                  </View>
                </Animated.View>

                {/* Step 2: Profile Details (New) */}
                <Animated.View style={[styles.stepContent, step2AnimatedStyle]}>
                  <View style={styles.step2Content}>
                    <View style={styles.step2FormContainer}>
                      <View style={styles.form}>
                        {/* Gender and Date of Birth Row */}
                        <View style={styles.selectRow}>
                          {/* Gender Selection */}
                          <View style={[styles.halfWidthInput]}>
                            <Text style={styles.selectLabel}>Gender</Text>
                            <View style={styles.selectContainer}>
                              <CustomPicker
                                items={[
                                  { label: "Male", value: "male" },
                                  { label: "Female", value: "female" },
                                ]}
                                selectedValue={formData.gender}
                                placeholder="your gender"
                                onValueChange={(value: string) =>
                                  updateFormData("gender", value)
                                }
                              />
                            </View>
                          </View>

                          <View style={styles.inputSpacer} />

                          {/* Date of Birth */}
                          <View style={[styles.halfWidthInput]}>
                            <Text style={styles.selectLabel}>
                              Date of Birth
                            </Text>
                            <TouchableOpacity
                              style={styles.datePickerButton}
                              onPress={() => setShowDatePicker(true)}
                            >
                              <Text style={styles.dateText}>
                                {formatDate(formData.dateOfBirth)}
                              </Text>
                              <Ionicons
                                name="calendar-outline"
                                size={20}
                                style={styles.calendarIcon}
                              />
                            </TouchableOpacity>
                            {showDatePicker && (
                              <DateTimePicker
                                value={formData.dateOfBirth}
                                mode="date"
                                display="default"
                                onChange={onDateChange}
                                maximumDate={new Date()}
                              />
                            )}
                          </View>
                        </View>

                        {/* Role and Language Row */}
                        <View style={styles.selectRow}>
                          {/* Role Selection */}
                          <View style={[styles.halfWidthInput]}>
                            <Text style={styles.selectLabel}>Role</Text>
                            <View style={styles.selectContainer}>
                              <CustomPicker
                                items={[
                                  { label: "Student", value: "student" },
                                  { label: "Teacher", value: "teacher" },
                                ]}
                                selectedValue={formData.role}
                                placeholder="your role"
                                onValueChange={(value: string) =>
                                  updateFormData("role", value)
                                }
                              />
                            </View>
                          </View>

                          <View style={styles.inputSpacer} />

                          {/* Language Selection */}
                          <View style={[styles.halfWidthInput]}>
                            <Text style={styles.selectLabel}>Language</Text>
                            <View style={styles.selectContainer}>
                              <CustomPicker
                                items={[
                                  { label: "Device Default", value: "Default" },
                                  { label: "English", value: "English" },
                                  { label: "French", value: "French" },
                                  { label: "Spanish", value: "Spanish" },
                                  { label: "Portuguese", value: "Portuguese" },
                                ]}
                                selectedValue={formData.preferredLanguage}
                                placeholder="select language"
                                onValueChange={(value: string) =>
                                  updateFormData("preferredLanguage", value)
                                }
                              />
                            </View>
                          </View>
                        </View>

                        {stepError && currentStep === 2 && (
                          <Text style={styles.errorText}>{stepError}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[
                          styles.baseButton,
                          styles.backButton,
                          isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleBack}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.backButtonText}>Back</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.baseButton,
                          styles.createButton,
                          (isLoading || !isStep2Valid) && styles.buttonDisabled,
                        ]}
                        onPress={handleContinue}
                        disabled={isLoading || !isStep2Valid}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.createButtonText}>Continue</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>

                {/* Step 3: Security (Previously Step 2) */}
                <Animated.View style={[styles.stepContent, step3AnimatedStyle]}>
                  <View style={styles.step2Content}>
                    <View style={styles.step2FormContainer}>
                      <View style={styles.form}>
                        <View style={styles.inputContainer}>
                          <CustomInput
                            icon="lock-closed"
                            placeholder="Create a password"
                            value={formData.password}
                            onChangeText={(text) =>
                              updateFormData("password", text)
                            }
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            focused={passwordFocused}
                            onFocus={() => setPasswordFocused(true)}
                            onBlur={() => setPasswordFocused(false)}
                            isPassword={true}
                            showPassword={showPassword}
                            onTogglePassword={() =>
                              setShowPassword(!showPassword)
                            }
                          />
                          {passwordStrength && (
                            <View style={styles.passwordStrength}>
                              <Text
                                style={[
                                  styles.strengthText,
                                  { color: passwordStrength.color },
                                ]}
                              >
                                Password strength: {passwordStrength.text}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View style={styles.inputContainer}>
                          <CustomInput
                            icon="checkmark-circle"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChangeText={(text) =>
                              updateFormData("confirmPassword", text)
                            }
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoCorrect={false}
                            focused={confirmPasswordFocused}
                            onFocus={() => setConfirmPasswordFocused(true)}
                            onBlur={() => setConfirmPasswordFocused(false)}
                            isPassword={true}
                            showPassword={showConfirmPassword}
                            onTogglePassword={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                          />
                          {formData.confirmPassword.length > 0 && (
                            <View style={styles.passwordMatch}>
                              <Text
                                style={[
                                  styles.matchText,
                                  {
                                    color: passwordsMatch
                                      ? "#10b981"
                                      : "#ef4444",
                                  },
                                ]}
                              >
                                {passwordsMatch
                                  ? "✓ Passwords match"
                                  : "✗ Passwords don't match"}
                              </Text>
                            </View>
                          )}
                        </View>

                        {stepError && currentStep === 3 && (
                          <Text style={styles.errorText}>{stepError}</Text>
                        )}
                      </View>
                    </View>

                    <View style={styles.buttonRow}>
                      <TouchableOpacity
                        style={[
                          styles.baseButton,
                          styles.backButton,
                          isLoading && styles.buttonDisabled,
                        ]}
                        onPress={handleBack}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.backButtonText}>Back</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.baseButton,
                          styles.createButton,
                          (isLoading || !isStep3Valid || !passwordsMatch) &&
                            styles.buttonDisabled,
                        ]}
                        onPress={handleRegister}
                        disabled={isLoading || !isStep3Valid || !passwordsMatch}
                        activeOpacity={0.8}
                      >
                        {isLoading ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color="white" />
                            <Text style={styles.createButtonText}>
                              Creating...
                            </Text>
                          </View>
                        ) : (
                          <Text style={styles.createButtonText}>
                            Create Account
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>

          {currentStep === 1 && (
            <View style={styles.staticBottom}>
              <Divider text="or continue with" />
              <SocialButton
                title="Continue with Google"
                icon="logo-google"
                onPress={handleGoogleRegister}
              />
              <View style={styles.footer}>
                <Text style={styles.footerText}>Already have an account?</Text>
                <TouchableOpacity onPress={() => router.push("/auth/login")}>
                  <Text style={styles.loginLink}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </LinearGradient>

      {/* Enhanced Loaders with better error messaging */}
      <Loader
        visible={isLoading}
        text={
          currentStep === 1
            ? "Verifying email..."
            : currentStep === 2
            ? "Processing information..."
            : "Creating Account..."
        }
        subtitle={
          currentStep === 1
            ? "Checking availability"
            : currentStep === 2
            ? "Preparing your profile"
            : "Setting up your account"
        }
        type="default"
      />

      <Loader
        visible={showSuccess}
        type="success"
        text="Account Created!"
        subtitle="Welcome to ExamPrep"
        duration={1500}
        onHide={handleSuccessHide}
        size="medium"
      />

      <Loader
        visible={showError}
        type="error"
        text="Registration Failed"
        subtitle={errorMessage || "Please check your information and try again"}
        duration={3000}
        onHide={handleErrorHide}
        size="medium"
      />
    </SafeAreaView>
  );
}
