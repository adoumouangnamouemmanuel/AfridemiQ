import { Preferences } from "./AfricaExamPrepDataStructure";

const preferences: Preferences = {
  notifications: {
    general: true,
    dailyReminderTime: "18:00",
    challengeNotifications: false,
    progressUpdates: true,
  },
  darkMode: false,
  fontSize: "medium",
  preferredContentFormat: "text",
  enableHints: true,
  autoPlayAudio: false,
  showStepSolutions: true,
  leaderboardVisibility: true,
  allowFriendRequests: true,
  multilingualSupport: ["French"],
};

export { preferences };