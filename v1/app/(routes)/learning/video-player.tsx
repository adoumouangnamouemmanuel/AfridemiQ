"use client";

import { Ionicons } from "@expo/vector-icons";
import { Video } from "expo-av";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import YoutubePlayer from "react-native-youtube-iframe";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

// Mock video data
const MOCK_VIDEO = {
  _id: "video_001",
  title: "Introduction to Algebraic Expressions",
  description:
    "Learn the fundamentals of variables, coefficients, and basic algebraic operations",
  duration: 525, // 8:45 in seconds
  url: "https://www.youtube.com/watch?v=RGaW82k4dK4",
  thumbnail: "https://example.com/algebra-thumb.jpg",
  subtitles: [
    {
      start: 0,
      end: 5,
      text: "Welcome to our lesson on algebraic expressions",
    },
    {
      start: 5,
      end: 12,
      text: "In algebra, we use letters to represent unknown numbers",
    },
    { start: 12, end: 18, text: "These letters are called variables" },
  ],
  chapters: [
    { time: 0, title: "Introduction" },
    { time: 60, title: "Variables and Coefficients" },
    { time: 180, title: "Like Terms" },
    { time: 300, title: "Distributive Property" },
    { time: 420, title: "Practice Examples" },
  ],
  quality: ["480p", "720p", "1080p"],
  playbackSpeed: [0.5, 0.75, 1, 1.25, 1.5, 2],
};

export default function VideoPlayerScreen() {
  const router = useRouter();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showChapters, setShowChapters] = useState(false);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getCurrentSubtitle = () => {
    return MOCK_VIDEO.subtitles.find(
      (sub) => currentTime >= sub.start && currentTime <= sub.end
    );
  };

  // COMMENTED OUT: These functions conflict with YouTube's native controls
  // const handlePlayPause = async () => {
  //   if (videoRef.current) {
  //     if (isPlaying) {
  //       await videoRef.current.pauseAsync();
  //     } else {
  //       await videoRef.current.playAsync();
  //     }
  //     setIsPlaying(!isPlaying);
  //   }
  // };

  // const handleSeek = async (time: number) => {
  //   if (videoRef.current) {
  //     await videoRef.current.setPositionAsync(time * 1000); // Convert to milliseconds
  //     setCurrentTime(time);
  //   }
  // };

  // const onPlaybackStatusUpdate = (status: any) => {
  //   if (status.isLoaded) {
  //     setCurrentTime(status.positionMillis / 1000); // Convert to seconds
  //     setIsPlaying(status.isPlaying);
  //   }
  // };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    // TODO: Implement fullscreen mode
  };

  const handleChapterPress = (time: number) => {
    // COMMENTED OUT: Can't seek YouTube videos with custom controls
    // handleSeek(time);
    setShowChapters(false);
    console.log(`Would seek to ${formatTime(time)}`);
  };

  // Add the missing onChangeState function for YoutubePlayer
  const onStateChange = (state: string) => {
    console.log("YouTube player state changed to:", state);

    switch (state) {
      case "playing":
        setIsPlaying(true);
        break;
      case "paused":
      case "ended":
        setIsPlaying(false);
        break;
      case "buffering":
        // Handle buffering state
        break;
      default:
        break;
    }
  };

  const progress = (currentTime / MOCK_VIDEO.duration) * 100;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#000000",
    },
    videoContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#000000",
    },
    videoPlaceholder: {
      width: SCREEN_WIDTH,
      height: isFullscreen ? SCREEN_HEIGHT : (SCREEN_WIDTH * 9) / 16,
      backgroundColor: "#1a1a1a",
      justifyContent: "center",
      alignItems: "center",
      position: "relative",
    },
    videoGradient: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "center",
      alignItems: "center",
    },
    playButton: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.9)",
      justifyContent: "center",
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    controlsOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "space-between",
      padding: 20,
    },
    topControls: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    videoTitle: {
      flex: 1,
      marginHorizontal: 16,
      fontSize: 16,
      fontWeight: "600",
      color: "white",
      fontFamily: "Inter-SemiBold",
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    bottomControls: {
      backgroundColor: "rgba(0,0,0,0.7)",
      borderRadius: 12,
      padding: 16,
    },
    progressContainer: {
      marginBottom: 16,
    },
    progressBar: {
      height: 4,
      backgroundColor: "rgba(255,255,255,0.3)",
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: "#3B82F6",
      borderRadius: 2,
    },
    timeContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 8,
    },
    timeText: {
      fontSize: 12,
      color: "white",
      fontFamily: "Inter-Regular",
    },
    controlsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    leftControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    rightControls: {
      flexDirection: "row",
      alignItems: "center",
      gap: 16,
    },
    controlButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(255,255,255,0.2)",
      justifyContent: "center",
      alignItems: "center",
    },
    subtitleContainer: {
      position: "absolute",
      bottom: 120,
      left: 20,
      right: 20,
      alignItems: "center",
    },
    subtitleText: {
      fontSize: 16,
      color: "white",
      textAlign: "center",
      backgroundColor: "rgba(0,0,0,0.7)",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      fontFamily: "Inter-Medium",
    },
    infoSection: {
      padding: 20,
      backgroundColor: "#F8FAFC",
    },
    videoInfo: {
      marginBottom: 20,
    },
    videoTitleText: {
      fontSize: 20,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 8,
    },
    videoDescription: {
      fontSize: 14,
      color: "#64748B",
      fontFamily: "Inter-Regular",
      lineHeight: 20,
    },
    chaptersSection: {
      backgroundColor: "white",
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: "#E2E8F0",
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "700",
      color: "#1E293B",
      fontFamily: "Inter-Bold",
      marginBottom: 16,
    },
    chapterItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "#F1F5F9",
    },
    chapterTime: {
      width: 60,
      fontSize: 12,
      color: "#3B82F6",
      fontFamily: "Inter-Medium",
    },
    chapterTitle: {
      flex: 1,
      fontSize: 14,
      color: "#1E293B",
      fontFamily: "Inter-Medium",
      marginLeft: 12,
    },
    settingsModal: {
      position: "absolute",
      top: 80,
      right: 20,
      backgroundColor: "rgba(0,0,0,0.9)",
      borderRadius: 12,
      padding: 16,
      minWidth: 200,
    },
    settingsItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: "rgba(255,255,255,0.1)",
    },
    settingsLabel: {
      fontSize: 14,
      color: "white",
      fontFamily: "Inter-Medium",
    },
    settingsValue: {
      fontSize: 14,
      color: "#3B82F6",
      fontFamily: "Inter-Medium",
    },
    chaptersModal: {
      position: "absolute",
      bottom: 200,
      left: 20,
      right: 20,
      backgroundColor: "rgba(0,0,0,0.9)",
      borderRadius: 12,
      padding: 16,
      maxHeight: 300,
    },
    chaptersHeader: {
      fontSize: 16,
      fontWeight: "600",
      color: "white",
      fontFamily: "Inter-SemiBold",
      marginBottom: 12,
    },
    chapterModalItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 8,
    },
    chapterModalTime: {
      width: 50,
      fontSize: 12,
      color: "#3B82F6",
      fontFamily: "Inter-Medium",
    },
    chapterModalTitle: {
      flex: 1,
      fontSize: 14,
      color: "white",
      fontFamily: "Inter-Regular",
      marginLeft: 12,
    },
    // New style for simple back button overlay
    backButtonOverlay: {
      position: "absolute",
      top: 20,
      left: 20,
      zIndex: 10,
    },
    // New styles for proper overlay positioning
    overlayContainer: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: isFullscreen ? 0 : (SCREEN_WIDTH * 9) / 16,
      zIndex: 10,
    },
    backButtonAbsolute: {
      position: "absolute",
      top: 20,
      left: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 20,
    },
    settingsButtonAbsolute: {
      position: "absolute",
      top: 20,
      right: 20,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 20,
    },
    chaptersButtonAbsolute: {
      position: "absolute",
      top: 20,
      right: 70,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: "rgba(0,0,0,0.7)",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 20,
    },
  });

  return (
    <View style={styles.container}>
      <StatusBar hidden={isFullscreen} />

      <View style={styles.videoContainer}>
        {/* YouTube Player Container */}
        <View style={styles.videoPlaceholder}>
          <YoutubePlayer
            height={isFullscreen ? SCREEN_HEIGHT : (SCREEN_WIDTH * 9) / 16}
            width={SCREEN_WIDTH}
            play={isPlaying}
            videoId="RGaW82k4dK4"
            onChangeState={onStateChange}
            webViewStyle={{ backgroundColor: "#1a1a1a" }}
          />
        </View>

        {/* Separate overlay container that doesn't interfere with YouTube player */}
        <View style={styles.overlayContainer} pointerEvents="box-none">
          {/* Back button - positioned absolutely */}
          <TouchableOpacity
            style={styles.backButtonAbsolute}
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="white" />
          </TouchableOpacity>

          {/* Settings button - positioned absolutely */}
          <TouchableOpacity
            style={styles.settingsButtonAbsolute}
            onPress={() => setShowSettings(!showSettings)}
            activeOpacity={0.8}
          >
            <Ionicons name="settings" size={20} color="white" />
          </TouchableOpacity>

          {/* Chapters button - positioned absolutely */}
          <TouchableOpacity
            style={styles.chaptersButtonAbsolute}
            onPress={() => setShowChapters(!showChapters)}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={20} color="white" />
          </TouchableOpacity>

          {/* Settings modal */}
          {showSettings && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.settingsModal}
              pointerEvents="auto"
            >
              <TouchableOpacity
                style={styles.settingsItem}
                onPress={() => setShowSettings(false)}
              >
                <Text style={styles.settingsLabel}>Close Settings</Text>
                <Ionicons name="close" size={16} color="white" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.settingsItem}>
                <Text style={styles.settingsLabel}>Subtitles</Text>
                <Text style={styles.settingsValue}>
                  Available in YouTube player
                </Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Chapters modal */}
          {showChapters && (
            <Animated.View
              entering={FadeIn.duration(200)}
              style={styles.chaptersModal}
              pointerEvents="auto"
            >
              <View style={styles.chaptersHeader}>
                <Text style={styles.chaptersHeader}>Chapters</Text>
                <TouchableOpacity onPress={() => setShowChapters(false)}>
                  <Ionicons name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
              {MOCK_VIDEO.chapters.map((chapter, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.chapterModalItem}
                  onPress={() => handleChapterPress(chapter.time)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.chapterModalTime}>
                    {formatTime(chapter.time)}
                  </Text>
                  <Text style={styles.chapterModalTitle}>{chapter.title}</Text>
                </TouchableOpacity>
              ))}
            </Animated.View>
          )}
        </View>
      </View>

      {/* Keep the info section */}
      {!isFullscreen && (
        <SafeAreaView style={styles.infoSection}>
          <View style={styles.videoInfo}>
            <Text style={styles.videoTitleText}>{MOCK_VIDEO.title}</Text>
            <Text style={styles.videoDescription}>
              {MOCK_VIDEO.description}
            </Text>
          </View>

          <View style={styles.chaptersSection}>
            <Text style={styles.sectionTitle}>Chapters</Text>
            {MOCK_VIDEO.chapters.map((chapter, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chapterItem}
                onPress={() => handleChapterPress(chapter.time)}
              >
                <Text style={styles.chapterTime}>
                  {formatTime(chapter.time)}
                </Text>
                <Text style={styles.chapterTitle}>{chapter.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </SafeAreaView>
      )}
    </View>
  );
}
