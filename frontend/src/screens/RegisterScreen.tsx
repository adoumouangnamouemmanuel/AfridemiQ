"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
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
  Divider,
  Loader,
  SocialButton,
} from "../components/common";
import { apiService } from "../services/api.service";
import { useUser } from "../utils/UserContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Dynamic sizing based on screen height
const isSmallScreen = SCREEN_HEIGHT < 700;
const isMediumScreen = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850;

export default function RegisterScreen() {
  const { setUser, setToken } = useUser();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  // Modified form data to include firstName and lastName instead of name
  const [formData, setFormData] = useState({
    firstName: "", // Added firstName field
    lastName: "", // Added lastName field
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);

  // Added focus states for first and last name fields
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [stepError, setStepError] = useState("");

  const slideUp = useSharedValue(100);
  const fadeIn = useSharedValue(0);
  const scaleIn = useSharedValue(0.8);
  const stepSlide = useSharedValue(0);

  React.useEffect(() => {
    slideUp.value = withDelay(300, withSpring(0, { damping: 20 }));
    fadeIn.value = withDelay(200, withSpring(1));
    scaleIn.value = withDelay(400, withSpring(1, { damping: 15 }));

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

  const imageAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ scale: scaleIn.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeIn.value,
    transform: [{ translateY: slideUp.value }],
  }));

  // Fixed animation styles for steps
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
        translateX: withTiming((1 - stepSlide.value) * SCREEN_WIDTH, {
          duration: 300,
        }),
      },
    ],
    opacity: withTiming(currentStep === 2 ? 1 : 0, { duration: 300 }),
  }));

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

  const validateStep1 = async () => {
    setStepError("");

    // Updated validation to check both firstName and lastName
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

  const validateStep2 = () => {
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

  const handleContinue = async () => {
    if (currentStep === 1) {
      const isValid = await validateStep1();
      if (isValid) {
        setCurrentStep(2);
        stepSlide.value = 1;
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
    setStepError("");
    stepSlide.value = 0;
  };

  const handleRegister = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      // Create a combined name from firstName and lastName
      // and prepare the data for API submission
      const { firstName, lastName, confirmPassword, ...otherData } = formData;
      const registrationData = {
        ...otherData,
        name: `${firstName.trim()} ${lastName.trim()}`, // Concatenate first and last name
      };

      const response = await apiService.register(registrationData);

      // Transform backend user data to match frontend User interface
      const userData = {
        id: response.user._id,
        name: response.user.name,
        email: response.user.email,
        country: response.user.country,
        selectedExam: response.user.progress.selectedExam || "",
        goalDate: response.user.progress.goalDate
          ? new Date(response.user.progress.goalDate)
          : undefined,
        xp: response.user.progress.xp,
        level: response.user.progress.level,
        streak: response.user.progress.streak.current,
        avatar: response.user.avatar,
        badges: response.user.progress.badges,
        completedTopics: response.user.progress.completedTopics,
        weakSubjects: response.user.progress.weakSubjects,
        isPremium: response.user.isPremium,
        role: response.user.role,
      };

      // Save user and token to storage
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      await AsyncStorage.setItem("token", response.token);

      // Set user and token in context
      setUser(userData);
      setToken(response.token);

      setIsLoading(false);
      setShowSuccess(true);
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      setShowError(true);
    }
  };

  const handleSuccessHide = () => {
    setShowSuccess(false);
    router.replace("/auth/onboarding");
  };

  const handleErrorHide = () => {
    setShowError(false);
  };

  const handleGoogleRegister = () => {
    Alert.alert("Google Sign Up", "Google authentication coming soon!");
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (stepError) setStepError(""); // Clear error when user starts typing
  };

  // Updated validation for buttons to check firstName and lastName instead of name
  const isStep1Valid =
    formData.firstName.trim() !== "" &&
    formData.lastName.trim() !== "" &&
    formData.email.trim() !== "";

  const isStep2Valid =
    formData.password.trim() !== "" && formData.confirmPassword.trim() !== "";

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
    // Added style for the row container
    nameInputRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: isSmallScreen ? 12 : 16,
    },
    // Added style for half-width inputs
    halfWidthInput: {
      flex: 1,
    },
    // Added style for spacing between inputs in a row
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
    // Fixed step container styles
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
      justifyContent: "center", // This centers the content vertically
    },
    // Step 2 specific content styling for better vertical centering
    step2Content: {
      flex: 1,
      justifyContent: "space-between", // Distributes space evenly
      paddingVertical: isSmallScreen ? 20 : 30,
    },
    step2FormContainer: {
      flex: 1,
      justifyContent: "center", // Centers the form vertically
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
      alignItems: "stretch", // Changed to stretch for equal height
      marginTop: isSmallScreen ? 30 : 40, // Increased margin for better spacing
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
                    : "Secure your account with a strong password"}
                </Text>
              </Animated.View>

              {/* Enhanced Step Indicator */}
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

                {/* Progress Line */}
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
                    ]}
                  >
                    {currentStep >= 2 ? (
                      <View style={styles.stepDotInner} />
                    ) : (
                      <Text style={[styles.stepNumber]}>2</Text>
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      currentStep >= 2 && styles.stepLabelActive,
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
                    {/* Replaced single name field with first name and last name row */}
                    <View style={styles.nameInputRow}>
                      {/* First Name Input */}
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

                      {/* Spacer between inputs */}
                      <View style={styles.inputSpacer} />

                      {/* Last Name Input */}
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

                {/* Step 2: Password and Confirm Password */}
                <Animated.View style={[styles.stepContent, step2AnimatedStyle]}>
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
                          (isLoading || !isStep2Valid || !passwordsMatch) &&
                            styles.buttonDisabled,
                        ]}
                        onPress={handleRegister}
                        disabled={isLoading || !isStep2Valid || !passwordsMatch}
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

      {/* Loaders */}
      <Loader
        visible={isLoading}
        text={currentStep === 1 ? "Verifying email..." : "Creating Account..."}
        subtitle={
          currentStep === 1
            ? "Checking availability"
            : "Setting up your profile"
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
        subtitle="Please check your information and try again"
        duration={2500}
        onHide={handleErrorHide}
        size="medium"
      />
    </SafeAreaView>
  );
}
