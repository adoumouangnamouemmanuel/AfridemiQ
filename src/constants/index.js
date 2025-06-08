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

/**
 * Constants for user profiles.
 * @module constants/index
 */
const USER_ROLES = ["student", "teacher", "admin"];
const SUBSCRIPTION_TYPES = ["free", "premium"];
const PAYMENT_STATUSES = ["active", "pending", "failed"];
const ACCESS_LEVELS = ["basic", "premium"];
const FONT_SIZES = ["small", "medium", "large"];
const CONTENT_FORMATS = ["video", "text", "audio", "mixed"];
const LEARNING_STYLES = ["visual", "auditory", "kinesthetic", "mixed"];
const PROFILE_VISIBILITIES = ["public", "friends", "private"];

/**
 * Constants for assessments.
 * @module constants/index
 */
const ASSESSMENT_FORMATS = ["quiz", "exam", "project", "practice", "mock"];
const DIFFICULTY_LEVELS = ["Easy", "Medium", "Hard", "Mixed"];
const EDUCATION_LEVELS = [
  "Primary",
  "JSS",
  "SSS",
  "University",
  "Professional",
];
const ASSESSMENT_STATUSES = ["draft", "published", "archived", "scheduled"];

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
  USER_ROLES,
  SUBSCRIPTION_TYPES,
  PAYMENT_STATUSES,
  ACCESS_LEVELS,
  FONT_SIZES,
  CONTENT_FORMATS,
  LEARNING_STYLES,
  PROFILE_VISIBILITIES,
  ASSESSMENT_FORMATS,
  DIFFICULTY_LEVELS,
  EDUCATION_LEVELS,
  ASSESSMENT_STATUSES,
};
