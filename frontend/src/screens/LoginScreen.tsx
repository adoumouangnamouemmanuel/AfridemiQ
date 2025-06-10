"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTheme } from "../utils/ThemeContext";
import { useUser } from "../utils/UserContext";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiService } from "../services/api.service";

export default function LoginScreen() {
  const { theme } = useTheme();
  const { setUser, setToken } = useUser();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(200, withSpring(1));
    opacity.value = withDelay(200, withSpring(1));
  }, [scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: theme.spacing.xxl,
    },
    logo: {
      width: 80,
      height: 80,
      borderRadius: 40,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 32,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 24,
    },
    form: {
      marginBottom: theme.spacing.xl,
    },
    inputContainer: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
      paddingHorizontal: theme.spacing.md,
      height: 50,
    },
    inputWrapperFocused: {
      borderColor: theme.colors.primary,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: 0,
    },
    inputIcon: {
      marginRight: theme.spacing.sm,
    },
    eyeIcon: {
      padding: theme.spacing.xs,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginTop: theme.spacing.sm,
    },
    forgotPasswordText: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "500",
    },
    loginButton: {
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    loginButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
    },
    divider: {
      flexDirection: "row",
      alignItems: "center",
      marginVertical: theme.spacing.lg,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
    },
    dividerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginHorizontal: theme.spacing.md,
    },
    googleButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      marginBottom: theme.spacing.xl,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    googleButtonText: {
      fontSize: 16,
      fontWeight: "500",
      color: theme.colors.text,
      marginLeft: theme.spacing.sm,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    footerText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
    },
    signupLink: {
      fontSize: 14,
      color: theme.colors.primary,
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
      fontSize: 16,
      fontWeight: "600",
      marginLeft: theme.spacing.sm,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View style={styles.content}>
          <Animated.View style={[styles.header, animatedStyle]}>
            <LinearGradient
              colors={[theme.colors.primary, theme.colors.secondary]}
              style={styles.logo}
            >
              <Ionicons name="school" size={40} color="white" />
            </LinearGradient>
            <Text style={styles.title}>Welcome Back!</Text>
            <Text style={styles.subtitle}>
              Sign in to continue your learning journey
            </Text>
          </Animated.View>

          <Animated.View style={[styles.form, animatedStyle]}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
                  size={20}
                  color={theme.colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.colors.textSecondary}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-outline" : "eye-off-outline"}
                    size={20}
                    color={theme.colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.loginButton}
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
          </Animated.View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleLogin}
          >
            <Ionicons name="logo-google" size={20} color="#DB4437" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>New here?</Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text style={styles.signupLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
