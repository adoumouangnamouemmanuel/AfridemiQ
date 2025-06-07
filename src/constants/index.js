/**
 * Constants for onboarding steps, notifications, and countries.
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

module.exports = {
  TOTAL_STEPS,
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  COUNTRY_REGIONS,
  EDUCATION_SYSTEMS,
};
