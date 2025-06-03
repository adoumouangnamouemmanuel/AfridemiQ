"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  country?: string;
  exam?: string;
  subjects?: string[];
  learningStyle?: string;
  goalDate?: Date;
  studyTime?: string;
  motivation?: string;
  xp?: number;
  streak?: number;
  level?: number;
  isPremium?: boolean;
  badges: any[];
  completedTopics: string[];
  selectedExam: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<User>) => Promise<void>;
  incrementStreak: () => void;
  addXP: (xp: number) => number;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        // Convert goalDate string back to Date if it exists
        if (parsedUser.goalDate) {
          parsedUser.goalDate = new Date(parsedUser.goalDate);
        }
        setUser(parsedUser);
      }
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Error saving user:", error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user exists in storage (for demo purposes)
      const existingUsers = await AsyncStorage.getItem("registeredUsers");
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      const foundUser = users.find(
        (u: any) => u.email === email && u.password === password
      );

      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          name: foundUser.name,
          email: foundUser.email,
          country: "TD", // Chad
          exam: "BAC", // Baccalauréat
          xp: foundUser.xp || 0,
          streak: foundUser.streak || 0,
          level: foundUser.level || 1,
          isPremium: foundUser.isPremium || false,
          badges: [],
          completedTopics: [],
          selectedExam: "BAC" // Set default exam to BAC
        };

        // Load onboarding data if available
        const onboardingData = await AsyncStorage.getItem("onboardingData");
        if (onboardingData) {
          const parsed = JSON.parse(onboardingData);
          userData.country = parsed.country || "TD";
          userData.exam = parsed.exam || "BAC";
          userData.subjects = parsed.subjects;
          userData.learningStyle = parsed.learningStyle;
          userData.goalDate = new Date(parsed.goalDate);
          userData.studyTime = parsed.studyTime;
          userData.motivation = parsed.motivation;
        }

        await saveUser(userData);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Check if user already exists
      const existingUsers = await AsyncStorage.getItem("registeredUsers");
      const users = existingUsers ? JSON.parse(existingUsers) : [];

      if (users.find((u: any) => u.email === email)) {
        return false; // User already exists
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        name,
        email,
        password,
        xp: 0,
        streak: 0,
        level: 1,
        isPremium: false,
      };

      users.push(newUser);
      await AsyncStorage.setItem("registeredUsers", JSON.stringify(users));

      const userData: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        country: "TD", // Chad
        exam: "BAC", // Baccalauréat
        xp: 0,
        streak: 0,
        level: 1,
        isPremium: false,
        badges: [],
        completedTopics: [],
        selectedExam: "BAC" // Set default exam to BAC
      };

      await saveUser(userData);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove([
        "user",
        "hasOnboarded",
        "onboardingData",
        "registrationData",
      ]);
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await saveUser(updatedUser);
    }
  };

  const addXP = (xp: number) => {
    // ...implementation
    return xp;
  };

  const incrementStreak = () => {
    // Implement your streak increment logic here
    setUser((prevUser) =>
      prevUser ? { ...prevUser, streak: (prevUser.streak || 0) + 1 } : prevUser
    );
  };


  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        updateUser,
        incrementStreak,
        addXP,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
