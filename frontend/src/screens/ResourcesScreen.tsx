"use client";

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
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

export default function ResourcesScreen() {
  const { theme } = useTheme();
  const { user } = useUser();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const tabs = [
    { id: "all", label: "All", icon: "apps" },
    { id: "exams", label: "Past Exams", icon: "document-text" },
    { id: "notes", label: "Notes", icon: "clipboard" },
    { id: "books", label: "Books", icon: "book" },
    { id: "videos", label: "Videos", icon: "play-circle" },
  ];

  const resources = [
    {
      id: "1",
      type: "exam",
      title: "WAEC Mathematics 2023",
      subject: "Mathematics",
      year: "2023",
      description: "Complete past questions with solutions",
      thumbnail: "/placeholder.svg?height=120&width=160",
      downloadUrl: "#",
      premium: false,
    },
    {
      id: "2",
      type: "video",
      title: "Quadratic Equations Masterclass",
      subject: "Mathematics",
      duration: "45 min",
      description: "Complete guide to solving quadratic equations",
      thumbnail: "/placeholder.svg?height=120&width=160",
      views: "12.5k",
      premium: true,
    },
    {
      id: "3",
      type: "book",
      title: "Essential Physics Formulas",
      subject: "Physics",
      pages: "156",
      description: "All important physics formulas in one place",
      thumbnail: "/placeholder.svg?height=120&width=160",
      downloadUrl: "#",
      premium: false,
    },
    {
      id: "4",
      type: "notes",
      title: "English Grammar Rules",
      subject: "English",
      description: "Comprehensive grammar notes with examples",
      thumbnail: "/placeholder.svg?height=120&width=160",
      downloadUrl: "#",
      premium: false,
    },
    {
      id: "5",
      type: "exam",
      title: "JAMB Chemistry 2022",
      subject: "Chemistry",
      year: "2022",
      description: "Past questions with detailed explanations",
      thumbnail: "/placeholder.svg?height=120&width=160",
      downloadUrl: "#",
      premium: true,
    },
    {
      id: "6",
      type: "video",
      title: "Cell Biology Explained",
      subject: "Biology",
      duration: "32 min",
      description: "Understanding cell structure and functions",
      thumbnail: "/placeholder.svg?height=120&width=160",
      views: "8.2k",
      premium: false,
    },
  ];

  const getFilteredResources = () => {
    let filtered = resources;

    if (selectedTab !== "all") {
      const typeMap = {
        exams: "exam",
        notes: "notes",
        books: "book",
        videos: "video",
      };
      filtered = filtered.filter(
        (resource) =>
          resource.type === typeMap[selectedTab as keyof typeof typeMap]
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(
        (resource) =>
          resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          resource.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const handleResourcePress = (resource: any) => {
    if (resource.premium && !user?.isPremium) {
      router.push("/(routes)/premium");
    } else {
      // Handle resource access
      console.log("Accessing resource:", resource.title);
    }
  };

  const AnimatedCard = ({
    children,
    delay = 0,
  }: {
    children: React.ReactNode;
    delay?: number;
  }) => {
    const translateY = useSharedValue(50);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
      translateY.value = withDelay(delay, withSpring(0));
      opacity.value = withDelay(delay, withSpring(1));
    }, [delay, opacity, translateY]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value,
    }));

    return <Animated.View style={animatedStyle}>{children}</Animated.View>;
  };

  const ResourceCard = ({
    resource,
    index,
  }: {
    resource: any;
    index: number;
  }) => (
    <AnimatedCard delay={200 + index * 100}>
      <TouchableOpacity
        style={styles.resourceCard}
        onPress={() => handleResourcePress(resource)}
      >
        <View style={styles.resourceThumbnail}>
          <Image
            source={{ uri: resource.thumbnail }}
            style={styles.thumbnailImage}
          />
          {resource.premium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color="white" />
            </View>
          )}
          {resource.type === "video" && (
            <View style={styles.playButton}>
              <Ionicons name="play" size={20} color="white" />
            </View>
          )}
        </View>

        <View style={styles.resourceContent}>
          <View style={styles.resourceHeader}>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <View
              style={[
                styles.typeTag,
                { backgroundColor: getTypeColor(resource.type) + "20" },
              ]}
            >
              <Ionicons
                name={getTypeIcon(resource.type) as any}
                size={12}
                color={getTypeColor(resource.type)}
              />
              <Text
                style={[
                  styles.typeText,
                  { color: getTypeColor(resource.type) },
                ]}
              >
                {resource.type.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.resourceSubject}>{resource.subject}</Text>
          <Text style={styles.resourceDescription}>{resource.description}</Text>

          <View style={styles.resourceMeta}>
            {resource.year && (
              <Text style={styles.metaText}>Year: {resource.year}</Text>
            )}
            {resource.duration && (
              <Text style={styles.metaText}>Duration: {resource.duration}</Text>
            )}
            {resource.pages && (
              <Text style={styles.metaText}>Pages: {resource.pages}</Text>
            )}
            {resource.views && (
              <Text style={styles.metaText}>Views: {resource.views}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </AnimatedCard>
  );

  const getTypeIcon = (type: string) => {
    const iconMap = {
      exam: "document-text",
      video: "play-circle",
      book: "book",
      notes: "clipboard",
    };
    return iconMap[type as keyof typeof iconMap] || "document";
  };

  const getTypeColor = (type: string) => {
    const colorMap = {
      exam: theme.colors.primary,
      video: theme.colors.error,
      book: theme.colors.success,
      notes: theme.colors.warning,
    };
    return (
      colorMap[type as keyof typeof colorMap] || theme.colors.textSecondary
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.lg,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: theme.spacing.lg,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    searchIcon: {
      marginRight: theme.spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      paddingVertical: theme.spacing.md,
    },
    tabsContainer: {
      marginBottom: theme.spacing.lg,
    },
    tabsScroll: {
      paddingHorizontal: theme.spacing.lg,
    },
    tab: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      marginRight: theme.spacing.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
    },
    activeTab: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    tabIcon: {
      marginRight: theme.spacing.xs,
    },
    tabText: {
      fontSize: 14,
      fontWeight: "500",
      color: theme.colors.text,
    },
    activeTabText: {
      color: "white",
    },
    content: {
      flex: 1,
      paddingHorizontal: theme.spacing.lg,
    },
    resourceCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      marginBottom: theme.spacing.md,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    resourceThumbnail: {
      position: "relative",
      height: 120,
    },
    thumbnailImage: {
      width: "100%",
      height: "100%",
      backgroundColor: theme.colors.border,
    },
    premiumBadge: {
      position: "absolute",
      top: theme.spacing.sm,
      right: theme.spacing.sm,
      backgroundColor: theme.colors.warning,
      borderRadius: 12,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    playButton: {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: [{ translateX: -20 }, { translateY: -20 }],
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
    },
    resourceContent: {
      padding: theme.spacing.md,
    },
    resourceHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: theme.spacing.sm,
    },
    resourceTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: theme.colors.text,
      flex: 1,
      marginRight: theme.spacing.sm,
    },
    typeTag: {
      flexDirection: "row",
      alignItems: "center",
      borderRadius: theme.borderRadius.sm,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: 4,
    },
    typeText: {
      fontSize: 10,
      fontWeight: "600",
      marginLeft: 4,
    },
    resourceSubject: {
      fontSize: 14,
      color: theme.colors.primary,
      fontWeight: "500",
      marginBottom: theme.spacing.xs,
    },
    resourceDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.sm,
    },
    resourceMeta: {
      flexDirection: "row",
      flexWrap: "wrap",
    },
    metaText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginRight: theme.spacing.md,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: theme.spacing.xxl,
    },
    emptyStateIcon: {
      marginBottom: theme.spacing.md,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: "600",
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: "center",
      lineHeight: 20,
    },
  });

  const filteredResources = getFilteredResources();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Resources</Text>
        <Text style={styles.subtitle}>
          Access past exams, notes, books, and video lessons
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color={theme.colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search resources..."
            placeholderTextColor={theme.colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, selectedTab === tab.id && styles.activeTab]}
              onPress={() => setSelectedTab(tab.id)}
            >
              <Ionicons
                name={tab.icon as any}
                size={16}
                color={selectedTab === tab.id ? "white" : theme.colors.text}
                style={styles.tabIcon}
              />
              <Text
                style={[
                  styles.tabText,
                  selectedTab === tab.id && styles.activeTabText,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredResources.length === 0 ? (
          <AnimatedCard delay={200}>
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <Ionicons
                  name="folder-open-outline"
                  size={64}
                  color={theme.colors.textSecondary}
                />
              </View>
              <Text style={styles.emptyStateText}>No resources found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          </AnimatedCard>
        ) : (
          filteredResources.map((resource, index) => (
            <ResourceCard key={resource.id} resource={resource} index={index} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
