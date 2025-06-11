// filepath: c:\Users\adoum\OneDrive\Bureau\exam-prep-app\frontend\src\screens\RegisterScreen.tsx
"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  CustomButton,
  CustomInput,
  Divider,
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
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "Tchad", // Default country
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const slideUp = useSharedValue(100);
  const fadeIn = useSharedValue(0);
  const scaleIn = useSharedValue(0.8);

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

  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.password) {
      Alert.alert("Missing Information", "Please fill in all fields");
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert("Weak Password", "Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.register(formData);

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

      Alert.alert(
        "Account Created Successfully!",
        "Please complete your onboarding to get started.",
        [
          {
            text: "Onboarding",
            onPress: () => router.replace("/auth/onboarding"),
          },
        ]
      );

      // After registration, go directly to onboarding
    } catch (error) {
      console.error("Registration error:", error);
      setIsLoading(false);
      Alert.alert(
        "Registration Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const handleGoogleRegister = () => {
    Alert.alert("Google Sign Up", "Google authentication coming soon!");
  };

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getPasswordStrength = () => {
    if (formData.password.length === 0) return null;
    if (formData.password.length < 8) return { text: "Weak", color: "#ef4444" };
    if (formData.password.length < 10)
      return { text: "Good", color: "#f59e0b" };
    return { text: "Strong", color: "#10b981" };
  };

  const passwordStrength = getPasswordStrength();

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
      paddingHorizontal: 24,
      paddingVertical: isSmallScreen ? 10 : 20,
    },
    staticBottom: {
      paddingBottom: Platform.OS === "ios" ? 20 : 16,
    },
    topSection: {
      flex: keyboardVisible
        ? isSmallScreen
          ? 0.25
          : 0.3
        : isSmallScreen
        ? 0.35
        : isMediumScreen
        ? 0.4
        : 0.45,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: isSmallScreen ? 10 : 20,
      marginBottom: keyboardVisible ? 0 : isSmallScreen ? 15 : 20,
    },
    imageContainer: {
      width: SCREEN_WIDTH * (isSmallScreen ? 0.5 : 0.6),
      height: SCREEN_HEIGHT * (isSmallScreen ? 0.15 : 0.2),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: isSmallScreen ? 8 : 16,
    },
    signUpImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    welcomeText: {
      fontSize: isSmallScreen ? 24 : 28,
      fontWeight: "700",
      fontFamily: "Poppins-Bold",
      color: "#1a1a1a",
      textAlign: "center",
      marginBottom: isSmallScreen ? 4 : 6,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: isSmallScreen ? 12 : 14,
      color: "#6B7280",
      fontFamily: "Inter-Regular",
      fontWeight: "400",
      textAlign: "center",
      lineHeight: isSmallScreen ? 16 : 20,
    },
    bottomSection: {
      flex: keyboardVisible
        ? isSmallScreen
          ? 0.75
          : 0.7
        : isSmallScreen
        ? 0.65
        : isMediumScreen
        ? 0.6
        : 0.55,
      justifyContent: "flex-start",
      paddingTop: keyboardVisible
        ? isSmallScreen
          ? 15
          : 20
        : isSmallScreen
        ? 10
        : 15,
      paddingBottom: 0,
    },
    form: {
      marginBottom: isSmallScreen ? 8 : 12,
    },
    inputContainer: {
      marginBottom: isSmallScreen ? 10 : 12,
    },
    passwordStrength: {
      marginTop: 4,
      alignItems: "flex-end",
    },
    strengthText: {
      fontSize: isSmallScreen ? 10 : 12,
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
                  Join thousands of students preparing for success
                </Text>
              </Animated.View>
            </View>

            <Animated.View style={[styles.bottomSection, formAnimatedStyle]}>
              <View style={styles.form}>
                <View style={styles.inputContainer}>
                  <CustomInput
                    icon="person"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChangeText={(text) => updateFormData("name", text)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    focused={nameFocused}
                    onFocus={() => setNameFocused(true)}
                    onBlur={() => setNameFocused(false)}
                  />
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

                <View style={styles.inputContainer}>
                  <CustomInput
                    icon="lock-closed"
                    placeholder="Create a password"
                    value={formData.password}
                    onChangeText={(text) => updateFormData("password", text)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    focused={passwordFocused}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    isPassword={true}
                    showPassword={showPassword}
                    onTogglePassword={() => setShowPassword(!showPassword)}
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

                <CustomButton
                  title="Create Account"
                  onPress={handleRegister}
                  disabled={isLoading}
                  isLoading={isLoading}
                  loadingText="Creating Account..."
                  marginTop={isSmallScreen ? 15 : 20}
                />
              </View>
            </Animated.View>
          </KeyboardAvoidingView>

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
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
