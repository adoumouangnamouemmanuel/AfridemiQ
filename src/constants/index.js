/**
 * Constants for onboarding steps and notifications.
 * @module constants
 */
const TOTAL_STEPS = [
  "profile_setup",
  "preferences",
  "subjects_selection",
  "exam_selection",
  "goals_setting",
  "tutorial_completion",
];

const NOTIFICATION_TYPES = [
  "reminder",
  "achievement",
  "study_group",
  "system",
  "friend_request",
  "friend_removed",
  "user_blocked",
];

const NOTIFICATION_PRIORITIES = ["low", "medium", "high"];

module.exports = { TOTAL_STEPS, NOTIFICATION_TYPES, NOTIFICATION_PRIORITIES };
