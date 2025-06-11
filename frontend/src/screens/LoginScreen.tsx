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
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
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
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const slideUp = useSharedValue(100);
  const fadeIn = useSharedValue(0);
  const scaleIn = useSharedValue(0.8);

  React.useEffect(() => {
    slideUp.value = withDelay(300, withSpring(0, { damping: 20 }));
    fadeIn.value = withDelay(200, withSpring(1));
    scaleIn.value = withDelay(400, withSpring(1, { damping: 15 }));
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

      // Check if user has completed onboarding
      const hasOnboarded = await AsyncStorage.getItem("hasOnboarded");

      if (hasOnboarded) {
        // User has completed onboarding, go to home
        router.replace("/(tabs)/home");
      } else {
        // User hasn't completed onboarding, go to onboarding
        router.replace("/auth/onboarding");
      }
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
      Alert.alert(
        "Login Failed",
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Sign In", "Google authentication coming soon!");
  };

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
      justifyContent: "space-between",
      paddingVertical: isSmallScreen ? 10 : 20,
    },
    topSection: {
      flex: isSmallScreen ? 0.45 : isMediumScreen ? 0.5 : 0.55,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: isSmallScreen ? 10 : 20,
    },
    imageContainer: {
      width: SCREEN_WIDTH * (isSmallScreen ? 0.5 : 0.6),
      height: SCREEN_HEIGHT * (isSmallScreen ? 0.18 : 0.25),
      justifyContent: "center",
      alignItems: "center",
      marginBottom: isSmallScreen ? 8 : 16,
    },
    signInImage: {
      width: "100%",
      height: "100%",
      resizeMode: "contain",
    },
    welcomeText: {
      fontSize: isSmallScreen ? 24 : 28,
      fontWeight: "800",
      color: "#1a1a1a",
      textAlign: "center",
      marginBottom: isSmallScreen ? 4 : 6,
      letterSpacing: -0.5,
    },
    subtitle: {
      fontSize: isSmallScreen ? 12 : 14,
      color: "#6B7280",
      textAlign: "center",
      lineHeight: isSmallScreen ? 16 : 20,
      fontWeight: "400",
    },
    bottomSection: {
      flex: isSmallScreen ? 0.55 : isMediumScreen ? 0.5 : 0.45,
      justifyContent: "flex-end",
      paddingBottom: Platform.OS === "ios" ? 20 : 16,
    },
    form: {
      marginBottom: isSmallScreen ? 12 : 16,
    },
    inputContainer: {
      marginBottom: isSmallScreen ? 12 : 16,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "white",
      borderRadius: 16,
      borderWidth: 2,
      borderColor: "#E5E7EB",
      paddingHorizontal: 16,
      height: isSmallScreen ? 48 : 52,
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    inputWrapperFocused: {
      borderColor: "#3B82F6",
      shadowColor: "#3B82F6",
      shadowOpacity: 0.15,
    },
    input: {
      flex: 1,
      fontSize: isSmallScreen ? 14 : 16,
      color: "#1F2937",
      paddingVertical: 0,
      fontWeight: "500",
    },
    inputIcon: {
      marginRight: 12,
    },
    eyeIcon: {
      padding: 8,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginTop: 8,
      paddingVertical: 4,
    },
    forgotPasswordText: {
      fontSize: isSmallScreen ? 12 : 14,
      color: "#3B82F6",
      fontWeight: "600",
    },
    loginButton: {
      borderRadius: 16,
      paddingVertical: isSmallScreen ? 12 : 14,
      alignItems: "center",
      marginBottom: isSmallScreen ? 12 : 16,
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
      borderRadius: 16,
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
      fontWeight: "400",
    },
    signupLink: {
      fontSize: isSmallScreen ? 13 : 15,
      color: "#3B82F6",
      fontWeight: "700",
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
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.content}>
            <View style={styles.topSection}>
              <Animated.View
                style={[styles.imageContainer, imageAnimatedStyle]}
              >
                <Image
                  source={require("../assets/sign-in/sign_in.png")}
                  style={styles.signInImage}
                />
              </Animated.View>
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
                  <View
                    style={[
                      styles.inputWrapper,
                      emailFocused && styles.inputWrapperFocused,
                    ]}
                  >
                    <Ionicons
                      name="mail"
                      size={22}
                      color={emailFocused ? "#3B82F6" : "#9CA3AF"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="#9CA3AF"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setEmailFocused(true)}
                      onBlur={() => setEmailFocused(false)}
                    />
                  </View>
                </View>

                <View style={styles.inputContainer}>
                  <View
                    style={[
                      styles.inputWrapper,
                      passwordFocused && styles.inputWrapperFocused,
                    ]}
                  >
                    <Ionicons
                      name="lock-closed"
                      size={22}
                      color={passwordFocused ? "#3B82F6" : "#9CA3AF"}
                      style={styles.inputIcon}
                    />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your password"
                      placeholderTextColor="#9CA3AF"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      onFocus={() => setPasswordFocused(true)}
                      onBlur={() => setPasswordFocused(false)}
                    />
                    <TouchableOpacity
                      style={styles.eyeIcon}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons
                        name={showPassword ? "eye" : "eye-off"}
                        size={22}
                        color="#9CA3AF"
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity style={styles.forgotPassword}>
                    <Text style={styles.forgotPasswordText}>
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={isLoading}
                  style={isLoading && styles.loginButtonDisabled}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#1D4ED8", "#1E40AF"]}
                    style={styles.loginButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Ionicons name="refresh" size={20} color="white" />
                        <Text style={styles.loadingText}>Signing In...</Text>
                      </View>
                    ) : (
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.googleButton}
                onPress={handleGoogleLogin}
              >
                <Ionicons name="logo-google" size={24} color="#DB4437" />
                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </TouchableOpacity>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Don&apos;t have an account?
                </Text>
                <TouchableOpacity onPress={() => router.push("/auth/register")}>
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}
