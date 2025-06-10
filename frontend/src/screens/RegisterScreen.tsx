// filepath: c:\Users\adoum\OneDrive\Bureau\exam-prep-app\frontend\src\screens\RegisterScreen.tsx
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
  ScrollView,
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

export default function RegisterScreen() {
  const { theme } = useTheme();
  const { setUser, setToken } = useUser();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    country: "Nigeria", // Default country
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  React.useEffect(() => {
    scale.value = withDelay(200, withSpring(1));
    opacity.value = withDelay(200, withSpring(1));
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
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
      backgroundColor: theme.colors.background,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.xl,
      minHeight: 600,
      justifyContent: "center",
    },
    header: {
      alignItems: "center",
      marginBottom: theme.spacing.xl,
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
      marginBottom: theme.spacing.lg,
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
    passwordStrength: {
      marginTop: theme.spacing.sm,
      alignItems: "flex-end",
    },
    strengthText: {
      fontSize: 12,
      fontWeight: "500",
    },
    registerButton: {
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: "center",
      marginBottom: theme.spacing.lg,
    },
    registerButtonText: {
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
    loginLink: {
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
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <Animated.View style={[styles.header, animatedStyle]}>
              <LinearGradient
                colors={[theme.colors.primary, theme.colors.secondary]}
                style={styles.logo}
              >
                <Ionicons name="person-add" size={40} color="white" />
              </LinearGradient>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>
                Join thousands of students preparing for success
              </Text>
            </Animated.View>

            <Animated.View style={[styles.form, animatedStyle]}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color={theme.colors.textSecondary}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.name}
                    onChangeText={(text) => updateFormData("name", text)}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>

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
                    value={formData.email}
                    onChangeText={(text) => updateFormData("email", text)}
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
                    placeholder="Create a password"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={formData.password}
                    onChangeText={(text) => updateFormData("password", text)}
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

              <TouchableOpacity onPress={handleRegister} disabled={isLoading}>
                <LinearGradient
                  colors={[theme.colors.primary, theme.colors.secondary]}
                  style={styles.registerButton}
                >
                  {isLoading ? (
                    <View style={styles.loadingContainer}>
                      <Ionicons name="refresh" size={20} color="white" />
                      <Text style={styles.loadingText}>
                        Creating Account...
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.registerButtonText}>
                      Create Account
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </Animated.View>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or sign up with</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleRegister}
            >
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.googleButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => router.push("/auth/login")}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
