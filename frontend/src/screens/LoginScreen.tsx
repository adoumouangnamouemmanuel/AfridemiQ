"use client";

import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Keyboard,
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
  Loader,
  SocialButton,
} from "../components/common";
import { apiService } from "../services/api.service";
import { useUser } from "../utils/UserContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Dynamic sizing based on screen height
const isSmallScreen = SCREEN_HEIGHT < 700;
const isMediumScreen = SCREEN_HEIGHT >= 700 && SCREEN_HEIGHT < 850;

export default function LoginScreen() {
  const { setUser, setToken } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
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

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        "Missing Information",
        "Please enter both email and password"
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.login({ email, password });

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
      if (response.refreshToken) {
        await AsyncStorage.setItem("refreshToken", response.refreshToken);
      }

      // Set user and token in context
      setUser(userData);
      setToken(response.token);

      setIsLoading(false);
      setShowSuccess(true);

      // Show success briefly before navigation
      setTimeout(() => {
        setShowSuccess(false);
        // Check if user has completed onboarding
        AsyncStorage.getItem("hasOnboarded").then((hasOnboarded) => {
          if (hasOnboarded) {
            router.replace("/(tabs)/home");
          } else {
            router.replace("/auth/onboarding");
          }
        });
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      setShowError(true);

      setTimeout(() => {
        setShowError(false);
      }, 2000);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Sign In", "Google authentication coming soon!");
  };

  // Add validation for button state
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFF",
    },
    gradient: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      justifyContent: "space-between",
      paddingVertical: isSmallScreen ? 10 : 20,
    },
    topSection: {
      flex: keyboardVisible
        ? isSmallScreen
          ? 0.25
          : 0.3
        : isMediumScreen
        ? 0.4
        : 0.45,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: isSmallScreen ? 5 : 15,
      marginBottom: keyboardVisible ? 0 : isSmallScreen ? 10 : 15,
    },
    imageContainer: {
      width: SCREEN_WIDTH * (isSmallScreen ? 0.45 : 0.55),
      height: SCREEN_HEIGHT * (isSmallScreen ? 0.15 : 0.2),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: isSmallScreen ? 6 : 12,
    },
    signInImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    welcomeText: {
      fontSize: isSmallScreen ? 22 : 26,
      fontWeight: "700",
      fontFamily: "Poppins-Bold",
      color: "#1a1a1a",
      textAlign: "center",
      marginBottom: isSmallScreen ? 3 : 5,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: isSmallScreen ? 11 : 13,
      fontFamily: "Inter-Regular",
      fontWeight: "400",
      color: "#6B7280",
      marginBottom: isSmallScreen ? 5 : 8,
      textAlign: "center",
      lineHeight: isSmallScreen ? 14 : 18,
    },
    graduationIcon: {
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: "#3B82F6",
      justifyContent: "center",
      alignItems: "center",
      marginBottom: isSmallScreen ? 8 : 12,
      shadowColor: "#3B82F6",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    bottomSection: {
      flex: keyboardVisible
        ? isSmallScreen
          ? 0.75
          : 0.85
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
      paddingBottom: keyboardVisible
        ? isSmallScreen
          ? 20
          : 25
        : Platform.OS === "ios"
        ? 20
        : 16,
    },
    form: {
      marginBottom: isSmallScreen ? 12 : 16,
    },
    inputContainer: {
      marginBottom: isSmallScreen ? 12 : 16,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginTop: 8,
      paddingVertical: 4,
    },
    forgotPasswordText: {
      fontSize: isSmallScreen ? 12 : 14,
      color: "#3B82F6",
      fontFamily: "Inter-SemiBold",
      fontWeight: "600",
    },
    loginButton: {
      borderRadius: 50,
      paddingVertical: isSmallScreen ? 12 : 14,
      alignItems: "center",
      shadowColor: "#3B82F6",
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    loginButtonDisabled: {
      opacity: 0.7,
    },
    loginButtonText: {
      color: "white",
      fontSize: isSmallScreen ? 16 : 18,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: isSmallScreen ? 12 : 16,
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
      marginBottom: isSmallScreen ? 12 : 16,
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
    googleIcon: {
      width: 24,
      height: 24,
      marginRight: 12,
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
    signupLink: {
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
    placeholder: {
      color: "#9CA3AF",
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={["#F8FAFF", "#EEF2FF", "#E0E7FF"]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.topSection}>
            {keyboardVisible ? (
              <Animated.View
                style={[styles.graduationIcon, imageAnimatedStyle]}
              >
                <Ionicons name="school" size={32} color="white" />
              </Animated.View>
            ) : (
              <Animated.View
                style={[styles.imageContainer, imageAnimatedStyle]}
              >
                <Image
                  source={require("../assets/sign-in/sign_in.png")}
                  style={styles.signInImage}
                />
              </Animated.View>
            )}
            <Animated.View style={imageAnimatedStyle}>
              <Text style={styles.welcomeText}>Welcome Back!</Text>
              <Text style={styles.subtitle}>
                Sign in to continue your amazing learning journey
              </Text>
            </Animated.View>
          </View>

          <Animated.View style={[styles.bottomSection, formAnimatedStyle]}>
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <CustomInput
                  icon="mail"
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
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
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
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
                <TouchableOpacity style={styles.forgotPassword}>
                  <Text style={styles.forgotPasswordText}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <CustomButton
                title="Sign In"
                onPress={handleLogin}
                disabled={isLoading || !isFormValid}
                isLoading={false}
                loadingText="Signing In..."
              />
            </View>

            {!keyboardVisible && (
              <>
                <Divider text="or continue with" />

                <SocialButton
                  title="Continue with Google"
                  icon="logo-google"
                  onPress={handleGoogleLogin}
                />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Don&apos;t have an account?
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/auth/register")}
                  >
                    <Text style={styles.signupLink}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </Animated.View>
        </View>
      </LinearGradient>

      {/* Loaders */}
      <Loader
        key="login-loading"
        visible={isLoading}
        text="Signing In..."
        type="default"
      />

      <Loader
        key="login-success"
        visible={showSuccess}
        text="Welcome Back!"
        type="success"
      />

      <Loader
        key="login-error"
        visible={showError}
        text="Login Failed"
        type="error"
      />
    </SafeAreaView>
  );
}
