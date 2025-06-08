/**
 * Constants for onboarding steps.
 * @module constants/index
 */
const TOTAL_STEPS = [
  "profile_setup",
  "preferences",
  "subjects_selection",
  "exam_selection",
  "goals_setting",
  "tutorial_completion",
];

/**
 * Constants for notifications.
 * @module constants/index
 */
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

/**
 * Constants for countries.
 * @module constants/index
 */
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

/**
 * Constants for parent access.
 * @module constants/index
 */
const PARENT_ACCESS_LEVELS = ["viewProgress", "viewReports", "fullAccess"];

const NOTIFICATION_FREQUENCIES = ["immediate", "daily", "weekly", "monthly"];

/**
 * Constants for peer tutor profiles.
 * @module constants/index
 */
const AVAILABILITY_DAYS = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

/**
 * Constants for tutoring sessions.
 * @module constants/index
 */
const SESSION_STATUSES = ["scheduled", "completed", "cancelled"];

module.exports = {
  TOTAL_STEPS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  COUNTRY_REGIONS,
  EDUCATION_SYSTEMS,
  PARENT_ACCESS_LEVELS,
  NOTIFICATION_FREQUENCIES,
  AVAILABILITY_DAYS,
  SESSION_STATUSES,
};
