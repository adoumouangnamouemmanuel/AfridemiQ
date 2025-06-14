"use client";

import AsyncStorage from "@react-native-async-storage/async-storage";
import type React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    h4: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    h5: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    h6: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    body: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    bodySmall: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    button: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    buttonSmall: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    label: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    labelSmall: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    caption: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    captionSmall: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
    overline: {
      fontSize: number;
      fontWeight: string;
      lineHeight: number;
      fontFamily: string;
    };
  };
}

const lightTheme: Theme = {
  colors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#059669",
    background: "#ffffff",
    surface: "#f8fafc",
    text: "#1e293b",
    textSecondary: "#64748b",
    border: "#e2e8f0",
    success: "#10b981",
    warning: "#f59e0b",
    error: "#ef4444",
    info: "#3b82f6",
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 50,
  },
  typography: {
    h1: {
      fontSize: 26,
      fontWeight: "700",
      lineHeight: 40,
      fontFamily: "Poppins-Bold",
    },
    h2: {
      fontSize: 22,
      fontWeight: "700",
      lineHeight: 32,
      fontFamily: "Poppins-Bold",
    },
    h3: {
      fontSize: 20,
      fontWeight: "600",
      lineHeight: 28,
      fontFamily: "Poppins-SemiBold",
    },
    h4: {
      fontSize: 18,
      fontWeight: "600",
      lineHeight: 26,
      fontFamily: "Poppins-SemiBold",
    },
    h5: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 24,
      fontFamily: "Poppins-SemiBold",
    },
    h6: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 22,
      fontFamily: "Poppins-SemiBold",
    },
    body: {
      fontSize: 16,
      fontWeight: "400",
      lineHeight: 24,
      fontFamily: "Inter-Regular",
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "400",
      lineHeight: 22,
      fontFamily: "Inter-Regular",
    },
    button: {
      fontSize: 16,
      fontWeight: "600",
      lineHeight: 20,
      fontFamily: "Inter-semiBold",
    },
    buttonSmall: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 18,
      fontFamily: "Inter-semiBold",
    },
    label: {
      fontSize: 14,
      fontWeight: "600",
      lineHeight: 20,
      fontFamily: "Inter-SemiBold",
    },
    labelSmall: {
      fontSize: 12,
      fontWeight: "600",
      lineHeight: 18,
      fontFamily: "Inter-SemiBold",
    },
    caption: {
      fontSize: 12,
      fontWeight: "500",
      lineHeight: 18,
      fontFamily: "Inter-Medium",
    },
    captionSmall: {
      fontSize: 10,
      fontWeight: "500",
      lineHeight: 16,
      fontFamily: "Inter-Medium",
    },
    overline: {
      fontSize: 11,
      fontWeight: "600",
      lineHeight: 16,
      fontFamily: "Inter-SemiBold",
    },
  },
};

const darkTheme: Theme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: "#0f172a",
    surface: "#1e293b",
    text: "#f1f5f9",
    textSecondary: "#94a3b8",
    border: "#334155",
  },
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === "dark");

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        setIsDark(savedTheme === "dark");
      }
    } catch (error) {
      console.error("Error loading theme:", error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem("theme", newTheme ? "dark" : "light");
    } catch (error) {
      console.error("Error saving theme:", error);
    }
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
