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
 * Constants for assessments and challenges.
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
const CHALLENGE_STATUSES = [
  "draft",
  "open",
  "active",
  "completed",
  "cancelled",
];

/**
 * Constants for exams.
 * @module constants/index
 */
const EXAM_TYPESuddy = ["certification", "concours", "test", "autre"];
const EXAM_TYPES = ["certification", "exam", "test", "autre"];
const EXAM_DIFFICULTIES = ["facile", "moyen", "difficile", "expert"];
const EXAM_FORMATS = ["papier", "ordinateur", "hybride"];
const ACCESSIBILITY_TYPES = [
  "braille",
  "large_print",
  "extra_time",
  "technical_assistance",
  "separate_room",
];
const IMPORTANT_DATE_TYPES = [
  "inscription",
  "examen",
  "resultats",
  "rattrapage",
];
const EXAM_SESSIONS = ["janvier", "juin", "septembre", "decembre"];

/**
 * Constants for exam schedules.
 * @module constants/index
 */
const EXAM_SCHEDULE_TYPES = ["mock", "practice", "official", "assessment"];
const VENUE_TYPES = ["online", "physical", "hybrid"];
const PARTICIPANT_STATUSES = [
  "registered",
  "confirmed",
  "attended",
  "absent",
  "cancelled",
];
const PAYMENT_STATUSES_EXAM_SCHEDULE = [
  "pending",
  "paid",
  "failed",
  "refunded",
];
const PROCTORING_TYPES = ["automated", "human", "hybrid"];
const EXAM_SCHEDULE_STATUSES = [
  "draft",
  "scheduled",
  "active",
  "completed",
  "cancelled",
  "postponed",
];

/**
 * Constants for exercises.
 * @module constants/index
 */
const EXERCISE_DIFFICULTY_LEVELS = ["beginner", "intermediate", "advanced"];
const EXERCISE_TYPES = ["practice", "quiz", "assignment", "exam"];
const QUESTION_TYPES = [
  "multiple_choice",
  "short_answer",
  "essay",
  "calculation",
  "diagram_labeling",
  "source_analysis",
  "map_analysis",
  "data_interpretation",
  "fill_in_the_blank",
  "text_sequencing",
  "true_false",
  "matching",
];
const EXERCISE_STATUSES = ["draft", "published", "archived"];
const ATTACHMENT_TYPES = ["image", "audio", "video", "document"];
const MATH_TOPICS = ["algebra", "geometry", "calculus", "statistics"];
const PHYSICS_TOPICS = [
  "mechanics",
  "electromagnetism",
  "thermodynamics",
  "optics",
];
const PHYSICS_DIAGRAM_TYPES = ["circuit", "force", "wave", "field"];
const CHEMISTRY_TOPICS = [
  "stoichiometry",
  "organic_chemistry",
  "thermodynamics",
  "acids_bases",
];
const BIOLOGY_TOPICS = ["cell_biology", "genetics", "ecology", "physiology"];
const FRENCH_TOPICS = ["grammar", "literature", "text_analysis", "composition"];
const PHILOSOPHY_TOPICS = [
  "ethics",
  "metaphysics",
  "epistemology",
  "political_philosophy",
];
const ENGLISH_TOPICS = [
  "grammar",
  "reading_comprehension",
  "writing_skills",
  "speaking",
];
const HISTORY_TOPICS = [
  "colonialism",
  "independence_movements",
  "world_wars",
  "chadian_history",
];
const HISTORY_SOURCE_TYPES = ["primary", "secondary"];
const GEOGRAPHY_TOPICS = [
  "physical_geography",
  "human_geography",
  "climate_and_environment",
  "chadian_geography",
];
const GEOGRAPHY_MAP_TYPES = ["physical", "political", "climate", "economic"];

/**
 * Constants for questions.
 * @module constants/index
 */
const QUESTION_LEVELS = [
  "primary",
  "junior_secondary",
  "senior_secondary",
  "university",
  "professional",
];
const QUESTION_STATUSES = [
  "draft",
  "review",
  "approved",
  "rejected",
  "archived",
];
const MEDIA_TYPES = ["image", "audio", "video", "document"];

/**
 * Constants for quizzes.
 * @module constants/index
 */
const QUIZ_LEVELS = EXERCISE_DIFFICULTY_LEVELS; // Reuse EXERCISE_DIFFICULTY_LEVELS for quiz levels

/**
 * Constants for quiz sessions.
 * @module constants/index
 */
const QUIZ_SESSION_STATUSES = [
  "not_started",
  "in_progress",
  "paused",
  "completed",
  "abandoned",
  "expired",
];

/**
 * Constants for gamified progress.
 * @module constants/index
 */
const GAMIFIED_REWARD_TYPES = ["badge", "points", "feature"];

/**
 * Constants for leaderboard entries.
 * @module constants/index
 */
const PERFORMANCE_TRENDS = ["improving", "declining", "stable"];

/**
 * Constants for missions.
 * @module constants/index
 */
const MISSION_TYPES = ["daily", "weekly", "monthly", "custom"];
const MISSION_DIFFICULTIES = ["easy", "medium", "hard"];
const MISSION_CATEGORIES = ["study", "practice", "achievement", "social"];

/**
 * Constants for topic progress.
 * @module constants/index
 */
const MASTERY_LEVELS = ["beginner", "intermediate", "advanced", "mastered"];

/**
 * Constants for hint usage.
 * @module constants/index
 */
const HINT_TYPES = ["step", "explanation", "formula", "example"];

/**
 * Constants for quiz results.
 * @module constants/index
 */
const QUIZ_RESULT_STATUSES = ["completed", "abandoned", "in_progress"];
const FEEDBACK_RATING_RANGE = { MIN: 0, MAX: 10 };

/**
 * Constants for adaptive learning.
 * @module constants/index
 */
const ADAPTIVE_LEARNING_LEVELS = ["beginner", "intermediate", "advanced"];
const ADJUSTMENT_METRICS = ["score", "timeSpent", "accuracy", "completionRate"];
const ADJUSTMENT_ACTIONS = [
  "increaseDifficulty",
  "decreaseDifficulty",
  "suggestResource",
];
const RECOMMENDED_CONTENT_TYPES = ["topic", "quiz", "resource"];

/**
 * Constants for bookmarks.
 * @module constants/index
 */
const BOOKMARK_CONTENT_TYPES = [
  "question",
  "resource",
  "course",
  "topic",
  "quiz",
];

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
  CHALLENGE_STATUSES,
  EXAM_TYPES,
  EXAM_DIFFICULTIES,
  EXAM_FORMATS,
  IMPORTANT_DATE_TYPES,
  EXAM_SESSIONS,
  EXAM_SCHEDULE_TYPES,
  VENUE_TYPES,
  PARTICIPANT_STATUSES,
  PAYMENT_STATUSES_EXAM_SCHEDULE,
  PROCTORING_TYPES,
  EXAM_SCHEDULE_STATUSES,
  EXERCISE_DIFFICULTY_LEVELS,
  EXERCISE_TYPES,
  QUESTION_TYPES,
  EXERCISE_STATUSES,
  ATTACHMENT_TYPES,
  MATH_TOPICS,
  PHYSICS_TOPICS,
  PHYSICS_DIAGRAM_TYPES,
  CHEMISTRY_TOPICS,
  BIOLOGY_TOPICS,
  FRENCH_TOPICS,
  PHILOSOPHY_TOPICS,
  ENGLISH_TOPICS,
  HISTORY_TOPICS,
  HISTORY_SOURCE_TYPES,
  GEOGRAPHY_TOPICS,
  GEOGRAPHY_MAP_TYPES,
  QUESTION_LEVELS,
  QUESTION_STATUSES,
  MEDIA_TYPES,
  QUIZ_LEVELS,
  QUIZ_SESSION_STATUSES,
  GAMIFIED_REWARD_TYPES,
  PERFORMANCE_TRENDS,
  MISSION_TYPES,
  MISSION_DIFFICULTIES,
  MISSION_CATEGORIES,
  MASTERY_LEVELS,
  HINT_TYPES,
  QUIZ_RESULT_STATUSES,
  FEEDBACK_RATING_RANGE,
  ADAPTIVE_LEARNING_LEVELS,
  ADJUSTMENT_METRICS,
  ADJUSTMENT_ACTIONS,
  RECOMMENDED_CONTENT_TYPES,
  BOOKMARK_CONTENT_TYPES,
};
