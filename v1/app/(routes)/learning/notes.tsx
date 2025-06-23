"use client";

import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeIn } from "react-native-reanimated";

// Enhanced mock notes data
const MOCK_NOTES = [
  {
    _id: "note_001",
    userId: "user_001",
    topicId: "topic_algebra",
    topicName: "Algebra Basics",
    subjectId: "math_001",
    subjectName: "Mathematics",
    series: ["D"],
    title: "Variables and Coefficients Summary",
    content:
      "Key points from today's lesson:\n\n• Variables are letters representing unknown numbers\n• Coefficients are numbers that multiply variables\n• In 3x, the coefficient is 3 and variable is x\n• Like terms have the same variable parts\n\nExamples:\n- 2x + 3x = 5x (combining like terms)\n- 4y - 2y = 2y\n- 3a + 2b cannot be simplified further",
    summary: "Basic concepts of algebraic expressions",
    type: "personal",
    status: "published",
    folder: "Algebra Basics",
    tags: [
      { name: "algebra", color: "#3B82F6" },
      { name: "basics", color: "#10B981" },
      { name: "exam-prep", color: "#F59E0B" },
    ],
    isPinned: true,
    isFavorite: false,
    isShared: false,
    metadata: {
      wordCount: 65,
      readingTime: 2,
      viewCount: 12,
      editCount: 3,
      lastEditedBy: "You",
    },
    attachments: [{ type: "image", name: "algebra_diagram.png", size: 245000 }],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    _id: "note_002",
    userId: "user_001",
    topicId: "topic_algebra",
    topicName: "Algebra Basics",
    subjectId: "math_001",
    subjectName: "Mathematics",
    series: ["D"],
    title: "Distributive Property Examples",
    content:
      "The distributive property states that a(b + c) = ab + ac\n\nExamples from class:\n\n1. 2(x + 3) = 2x + 6\n2. 4(2y - 1) = 8y - 4\n3. -3(a + 2b) = -3a - 6b\n4. 5(3m + 4n - 2) = 15m + 20n - 10\n\nRemember: multiply the outside number by each term inside the parentheses!\n\nCommon mistakes to avoid:\n- Don't forget the negative signs\n- Apply to ALL terms inside parentheses",
    summary: "Practice examples for distributive property",
    type: "study",
    status: "draft",
    folder: "Algebra Basics",
    tags: [
      { name: "distributive", color: "#F59E0B" },
      { name: "examples", color: "#EF4444" },
      { name: "practice", color: "#8B5CF6" },
    ],
    isPinned: false,
    isFavorite: true,
    isShared: true,
    metadata: {
      wordCount: 89,
      readingTime: 2,
      viewCount: 8,
      editCount: 5,
      lastEditedBy: "You",
    },
    attachments: [],
    createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    _id: "note_003",
    userId: "user_001",
    topicId: "topic_geometry",
    topicName: "Geometry",
    subjectId: "math_001",
    subjectName: "Mathematics",
    series: ["D"],
    title: "Triangle Properties Quick Reference",
    content:
      "Types of Triangles:\n\n1. By sides:\n   • Equilateral: all sides equal\n   • Isosceles: two sides equal\n   • Scalene: all sides different\n\n2. By angles:\n   • Acute: all angles < 90°\n   • Right: one angle = 90°\n   • Obtuse: one angle > 90°\n\nKey formulas:\n• Area = ½ × base × height\n• Perimeter = sum of all sides\n• Sum of angles = 180°",
    summary: "Essential triangle properties and formulas",
    type: "reference",
    status: "published",
    folder: "Geometry",
    tags: [
      { name: "geometry", color: "#06B6D4" },
      { name: "triangles", color: "#84CC16" },
      { name: "formulas", color: "#F97316" },
    ],
    isPinned: true,
    isFavorite: true,
    isShared: false,
    metadata: {
      wordCount: 78,
      readingTime: 2,
      viewCount: 15,
      editCount: 2,
      lastEditedBy: "You",
    },
    attachments: [
      { type: "image", name: "triangle_types.jpg", size: 156000 },
      { type: "pdf", name: "triangle_formulas.pdf", size: 89000 },
    ],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
  {
    _id: "note_004",
    userId: "user_001",
    topicId: "topic_mechanics",
    topicName: "Mechanics",
    subjectId: "physics_001",
    subjectName: "Physics",
    series: ["D"],
    title: "Newton's Laws Summary",
    content:
      "Newton's three laws of motion explained with examples and applications.",
    summary: "Physics fundamentals",
    type: "personal",
    status: "published",
    folder: "Physics Basics",
    tags: [{ name: "physics", color: "#8B5CF6" }],
    isPinned: false,
    isFavorite: false,
    isShared: true,
    metadata: {
      wordCount: 45,
      readingTime: 1,
      viewCount: 5,
      editCount: 1,
      lastEditedBy: "You",
    },
    attachments: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
  },
];

export default function NotesScreen() {
  const router = useRouter();
  const { topicId, topicName } = useLocalSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "pinned" | "favorites" | "shared"
  >("all");
  const [selectedFolder, setSelectedFolder] = useState<string>("all");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [notes, setNotes] = useState(MOCK_NOTES);
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // TODO: Connect to backend API
  // TODO: Add actual navigation hooks
  // TODO: Integrate with state management

  const folders = Array.from(new Set(notes.map((note) => note.folder)));
  const topics = Array.from(new Set(notes.map((note) => note.topicName)));
  const subjects = Array.from(new Set(notes.map((note) => note.subjectName)));

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.tags.some((tag) =>
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "all" ||
      (selectedFilter === "pinned" && note.isPinned) ||
      (selectedFilter === "favorites" && note.isFavorite) ||
      (selectedFilter === "shared" && note.isShared);

    const matchesFolder =
      selectedFolder === "all" || note.folder === selectedFolder;
    const matchesTopic =
      selectedTopic === "all" || note.topicName === selectedTopic;
    const matchesSubject =
      selectedSubject === "all" || note.subjectName === selectedSubject;

    return (
      matchesSearch &&
      matchesFilter &&
      matchesFolder &&
      matchesTopic &&
      matchesSubject
    );
  });

  const handleNotePress = (noteId: string) => {
    // TODO: Navigate to note detail/edit screen
    console.log(`Navigate to note: ${noteId}`);
  };

  const handleCreateNote = () => {
    // TODO: Navigate to create note screen
    console.log("Create new note");
  };

  const clearAllFilters = () => {
    setSelectedFilter("all");
    setSelectedFolder("all");
    setSelectedTopic("all");
    setSelectedSubject("all");
  };

  const handleNoteAction = (noteId: string, action: string) => {
    switch (action) {
      case "pin":
        setNotes((prev) =>
          prev.map((note) =>
            note._id === noteId ? { ...note, isPinned: !note.isPinned } : note
          )
        );
        break;
      case "favorite":
        setNotes((prev) =>
          prev.map((note) =>
            note._id === noteId
              ? { ...note, isFavorite: !note.isFavorite }
              : note
          )
        );
        break;
      case "share":
        setNotes((prev) =>
          prev.map((note) =>
            note._id === noteId ? { ...note, isShared: !note.isShared } : note
          )
        );
        break;
      case "delete":
        Alert.alert(
          "Delete Note",
          "Are you sure you want to delete this note?",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Delete",
              style: "destructive",
              onPress: () =>
                setNotes((prev) => prev.filter((note) => note._id !== noteId)),
            },
          ]
        );
        break;
    }
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "#10B981";
      case "draft":
        return "#F59E0B";
      default:
        return "#6B7280";
    }
  };

  const renderFilterModal = () => (
    <Modal visible={showFilterModal} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Filter Notes</Text>
            <TouchableOpacity onPress={() => setShowFilterModal(false)}>
              <Ionicons name="close" size={24} color="#64748B" />
            </TouchableOpacity>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Status</Text>
            <View style={styles.filterOptions}>
              {[
                { key: "all", label: "All Notes" },
                { key: "pinned", label: "Pinned" },
                { key: "favorites", label: "Favorites" },
                { key: "shared", label: "Shared" },
              ].map((filter) => (
                <TouchableOpacity
                  key={filter.key}
                  style={[
                    styles.filterOption,
                    selectedFilter === filter.key && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedFilter(filter.key as any)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFilter === filter.key &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Subject</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedSubject === "all" && styles.filterOptionActive,
                ]}
                onPress={() => setSelectedSubject("all")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedSubject === "all" && styles.filterOptionTextActive,
                  ]}
                >
                  All Subjects
                </Text>
              </TouchableOpacity>
              {subjects.map((subject) => (
                <TouchableOpacity
                  key={subject}
                  style={[
                    styles.filterOption,
                    selectedSubject === subject && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedSubject(subject)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSubject === subject &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {subject}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Topic</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedTopic === "all" && styles.filterOptionActive,
                ]}
                onPress={() => setSelectedTopic("all")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedTopic === "all" && styles.filterOptionTextActive,
                  ]}
                >
                  All Topics
                </Text>
              </TouchableOpacity>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic}
                  style={[
                    styles.filterOption,
                    selectedTopic === topic && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedTopic(topic)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedTopic === topic && styles.filterOptionTextActive,
                    ]}
                  >
                    {topic}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Folder</Text>
            <View style={styles.filterOptions}>
              <TouchableOpacity
                style={[
                  styles.filterOption,
                  selectedFolder === "all" && styles.filterOptionActive,
                ]}
                onPress={() => setSelectedFolder("all")}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    selectedFolder === "all" && styles.filterOptionTextActive,
                  ]}
                >
                  All Folders
                </Text>
              </TouchableOpacity>
              {folders.map((folder) => (
                <TouchableOpacity
                  key={folder}
                  style={[
                    styles.filterOption,
                    selectedFolder === folder && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedFolder(folder)}
                >
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedFolder === folder &&
                        styles.filterOptionTextActive,
                    ]}
                  >
                    {folder}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.clearButton}
              onPress={clearAllFilters}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderNoteCard = ({ item: note }: { item: (typeof MOCK_NOTES)[0] }) => {
    return (
      <Animated.View entering={FadeIn.duration(300).delay(100)}>
        <TouchableOpacity
          style={[styles.noteCard, note.isPinned && styles.pinnedCard]}
          onPress={() => handleNotePress(note._id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              note.isPinned ? ["#FEF3C7", "#FDE68A"] : ["#FFFFFF", "#F8FAFC"]
            }
            style={styles.noteCardGradient}
          >
            <View style={styles.noteHeader}>
              <View style={styles.noteTitle}>
                <Text style={styles.noteTitleText} numberOfLines={2}>
                  {note.title}
                </Text>
                <View style={styles.noteIcons}>
                  {note.isPinned && (
                    <Ionicons name="pin" size={16} color="#F59E0B" />
                  )}
                  {note.isFavorite && (
                    <Ionicons name="heart" size={16} color="#EF4444" />
                  )}
                  {note.isShared && (
                    <Ionicons name="share" size={16} color="#3B82F6" />
                  )}
                </View>
              </View>
              <View style={styles.noteMetaRow}>
                <View style={styles.folderBadge}>
                  <Ionicons name="folder" size={12} color="#64748B" />
                  <Text style={styles.folderText}>{note.folder}</Text>
                </View>
                <Text style={styles.subjectTopicText}>
                  {note.subjectName} • {note.topicName}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(note.status) + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusText,
                      { color: getStatusColor(note.status) },
                    ]}
                  >
                    {note.status}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.noteContent} numberOfLines={3}>
              {note.content}
            </Text>

            {note.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {note.tags.slice(0, 3).map((tag, index) => (
                  <View
                    key={index}
                    style={[styles.tag, { backgroundColor: tag.color + "20" }]}
                  >
                    <Text style={[styles.tagText, { color: tag.color }]}>
                      {tag.name}
                    </Text>
                  </View>
                ))}
                {note.tags.length > 3 && (
                  <Text style={styles.moreTagsText}>
                    +{note.tags.length - 3}
                  </Text>
                )}
              </View>
            )}

            {note.attachments.length > 0 && (
              <View style={styles.attachmentsContainer}>
                <Ionicons name="attach" size={14} color="#64748B" />
                <Text style={styles.attachmentsText}>
                  {note.attachments.length} attachment
                  {note.attachments.length > 1 ? "s" : ""}
                </Text>
              </View>
            )}

            <View style={styles.noteFooter}>
              <View style={styles.noteStats}>
                <View style={styles.stat}>
                  <Ionicons name="time" size={12} color="#9CA3AF" />
                  <Text style={styles.statText}>
                    {note.metadata.readingTime} min
                  </Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="eye" size={12} color="#9CA3AF" />
                  <Text style={styles.statText}>{note.metadata.viewCount}</Text>
                </View>
                <View style={styles.stat}>
                  <Ionicons name="create" size={12} color="#9CA3AF" />
                  <Text style={styles.statText}>{note.metadata.editCount}</Text>
                </View>
              </View>
              <View style={styles.noteActions}>
                <Text style={styles.timeAgo}>{getTimeAgo(note.updatedAt)}</Text>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleNoteAction(note._id, "favorite")}
                >
                  <Ionicons
                    name={note.isFavorite ? "heart" : "heart-outline"}
                    size={16}
                    color={note.isFavorite ? "#EF4444" : "#9CA3AF"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleNoteAction(note._id, "pin")}
                >
                  <Ionicons
                    name={note.isPinned ? "pin" : "pin-outline"}
                    size={16}
                    color={note.isPinned ? "#F59E0B" : "#9CA3AF"}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#F8FAFC",
    },
    header: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: "white",
      borderBottomWidth: 1,
      borderBottomColor: "#E2E8F0",
    },
    headerTop: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    backButton: {
      marginRight: 16,
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    headerContent: {
      flex: 1,
    },
    title: {
      fontSize: 24,
      fontWeight: "800",
      color: "#1E293B",
      fontFamily: "Inter-ExtraBold",
    },
    subtitle: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      marginTop: 2,
    },
    headerActions: {
      flexDirection: "row",
      gap: 8,
    },
    createButton: {
      borderRadius: 16,
      overflow: "hidden",
      shadowColor: "#3B82F6",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    createButtonGradient: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    createButtonText: {
      color: "white",
      fontSize: 14,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    viewModeButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
    },
    activeViewMode: {
      backgroundColor: "#3B82F6",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F8FAFC",
      borderRadius: 50,
      paddingHorizontal: 16,
      paddingVertical: 0,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: "#1E293B",
      fontFamily: "Inter-Regular",
      marginLeft: 8,
    },
    content: {
      flex: 1,
      padding: 20,
    },
    noteCard: {
      marginBottom: 16,
      borderRadius: 20,
      overflow: "hidden",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 12,
      elevation: 6,
    },
    pinnedCard: {
      shadowColor: "#F59E0B",
      shadowOpacity: 0.2,
    },
    noteCardGradient: {
      padding: 20,
    },
    noteHeader: {
      marginBottom: 12,
    },
    noteTitle: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 8,
    },
    noteTitleText: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      flex: 1,
      marginRight: 8,
    },
    noteIcons: {
      flexDirection: "row",
      gap: 8,
    },
    noteMetaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: 8,
    },
    folderBadge: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: "#F1F5F9",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      gap: 4,
    },
    folderText: {
      fontSize: 11,
      color: "#64748B",
      fontFamily: "Inter-Medium",
    },
    subjectTopicText: {
      fontSize: 11,
      color: "#3B82F6",
      fontFamily: "Inter-Medium",
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 11,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    noteContent: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
      marginBottom: 16,
    },
    tagsContainer: {
      flexDirection: "row",
      gap: 8,
      marginBottom: 12,
      flexWrap: "wrap",
      alignItems: "center",
    },
    tag: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
    },
    tagText: {
      fontSize: 12,
      fontWeight: "600",
      fontFamily: "Inter-SemiBold",
    },
    moreTagsText: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    attachmentsContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
      backgroundColor: "#F8FAFC",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    attachmentsText: {
      fontSize: 12,
      color: "#64748B",
      fontFamily: "Inter-Medium",
    },
    noteFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    noteStats: {
      flexDirection: "row",
      gap: 16,
    },
    stat: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    statText: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    noteActions: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    timeAgo: {
      fontSize: 12,
      color: "#9CA3AF",
      fontFamily: "Inter-Regular",
    },
    actionButton: {
      padding: 4,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 60,
    },
    emptyStateIcon: {
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 8,
    },
    emptyStateText: {
      fontSize: 14,
      color: "#64748B",
      textAlign: "center",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    filterButton: {
      padding: 8,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
      marginRight: 8,
    },
    // Modal styles
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: "white",
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 40,
        maxHeight: "80%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
    },
    filterSection: {
      marginBottom: 24,
    },
    filterSectionTitle: {
      fontSize: 16,
      fontWeight: "600",
      color: "#1E293B",
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    filterOptions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
    },
    filterOption: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: "#F1F5F9",
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    filterOptionActive: {
      backgroundColor: "#3B82F6",
      borderColor: "#3B82F6",
    },
    filterOptionText: {
      fontSize: 14,
      color: "#64748B",
      fontWeight: "500",
      fontFamily: "Inter-Medium",
    },
    filterOptionTextActive: {
      color: "white",
    },
    modalActions: {
      flexDirection: "row",
      gap: 12,
      marginVertical: 0,
    },
    clearButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#F1F5F9",
      alignItems: "center",
    },
    clearButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "#64748B",
      fontFamily: "Inter-SemiBold",
    },
    applyButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 12,
      backgroundColor: "#3B82F6",
        alignItems: "center",
    },
    applyButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
      fontFamily: "Inter-SemiBold",
    },
  });

  return (
    <SafeAreaView style={styles.container} edges={["bottom", "top"]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={20} color="#64748B" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.title}>My Notes</Text>
            <Text style={styles.subtitle}>
              {topicName ? `${topicName} • ` : ""}
              {filteredNotes.length} notes
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setShowFilterModal(true)}
            >
              <Ionicons name="filter" size={20} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleCreateNote}
            >
              <LinearGradient
                colors={["#3B82F6", "#1D4ED8"]}
                style={styles.createButtonGradient}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createButtonText}>New</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#9CA3AF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#9CA3AF"
          />
        </View>
      </View>

      <View style={styles.content}>
        {filteredNotes.length > 0 ? (
          <FlatList
            data={filteredNotes}
            renderItem={renderNoteCard}
            keyExtractor={(item) => item._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <Animated.View
            entering={FadeIn.duration(500)}
            style={styles.emptyState}
          >
            <Ionicons
              name="document-text-outline"
              size={64}
              color="#E2E8F0"
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateTitle}>No notes found</Text>
            <Text style={styles.emptyStateText}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Create your first note to get started"}
            </Text>
          </Animated.View>
        )}
      </View>

      {renderFilterModal()}
    </SafeAreaView>
  );
}
