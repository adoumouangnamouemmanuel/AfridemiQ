/**
 * Constants for onboarding steps, notifications, countries, and parent access.
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
  "daily_progress",
  "weekly_summary",
  "low_performance",
  "exam_reminder",
];

const NOTIFICATION_PRIORITIES = ["low", "medium", "high"];

const COUNTRY_REGIONS = [
  "North Africa",
  "West Africa",
  "East Africa",
  "Central Africa",
  "Southern Africa",
];

const EDUCATION_SYSTEMS = [
  "French",
  "British",
  "American",
  "Portuguese",
  "Arabic",
  "Mixed",
];

const PARENT_ACCESS_LEVELS = ["viewProgress", "viewReports", "fullAccess"];

const NOTIFICATION_FREQUENCIES = ["immediate", "daily", "weekly", "monthly"];

module.exports = {
  TOTAL_STEPS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  COUNTRY_REGIONS,
  EDUCATION_SYSTEMS,
  PARENT_ACCESS_LEVELS,
  NOTIFICATION_FREQUENCIES,
};
