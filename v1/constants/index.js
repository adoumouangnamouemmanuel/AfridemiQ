/**
 * Constants pour la plateforme de préparation aux examens africains
 * @module constants/index
 */

// =============== CORE AFRICA-SPECIFIC CONSTANTS ===============

/**
 * Pays supportés pour les examens africains
 */
const COUNTRIES = ["nigeria", "ghana", "kenya", "cameroon", "senegal", "chad"];

/**
 * Types d'examens africains
 */
const EXAM_TYPES = [
  "WAEC", // West African Examinations Council
  "NECO", // National Examinations Council (Nigeria)
  "JAMB", // Joint Admissions and Matriculation Board (Nigeria)
  "KCSE", // Kenya Certificate of Secondary Education
  "BAC", // Baccalauréat (Francophone countries)
  "BEPC", // Brevet d'Études du Premier Cycle
];

/**
 * Niveaux d'éducation détaillés
 */
const EDUCATION_LEVELS = [
  "junior_secondary", // JSS/Collège (Ages 12-15)
  "senior_secondary", // SSS/Lycée (Ages 15-18)
  ];
  
  /**
   * Classes spécifiques par système
   */
  const GRADE_LEVELS = {
    // Nigerian/West African System
    junior_secondary: ["jss1", "jss2", "jss3"],
    senior_secondary: ["sss1", "sss2", "sss3"],
    
    // Francophone System  
    college: ["6eme", "5eme", "4eme", "3eme"],
    lycee: ["2nde", "1ere", "terminale"],
    
    // Kenyan System
  form: ["form1", "form2", "form3", "form4"],
  };

/**
 * Langues supportées
 */
const LANGUAGES = ["english", "french"];

// =============== CORE CONTENT CONSTANTS ===============

/**
 * Catégories de matières
 */
const SUBJECT_CATEGORIES = [
  "sciences",
  "languages",
  "mathematics",
  "social_studies",
];

/**
 * Niveaux de difficulté
 */
const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];

/**
 * learning objectives
 * /
 const LEARNING_OBJECTIVES = ["remember", "understand", "apply", "analyze"];
 
/**
 * Types de questions
 */
const QUESTION_TYPES = ["multiple_choice", "true_false", "short_answer"];

/**
 * Formats de quiz
 */
const QUIZ_FORMATS = ["practice", "mock_exam", "topic_review"];

// =============== USER & PROGRESS CONSTANTS ===============

/**
 * Rôles utilisateur
 */
const USER_ROLES = ["student", "admin"];

/**
 * Statuts génériques
 */
const STATUSES = ["active", "inactive", "archived"];

/**
 * Statuts de session de quiz
 */
const QUIZ_SESSION_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "abandoned",
];

/**
 * Types de genre
 */
const GENDERS = ["male", "female", "prefer_not_to_say"];

// =============== NOTIFICATION CONSTANTS ===============

/**
 * Types de notifications (simplifiés)
 */
const NOTIFICATION_TYPES = ["study_reminder", "exam_alert", "progress_update"];

// =============== MEDIA & FILES ===============

/**
 * Types de média
 */

const LEARNING_OBJECTIVES = ["remember", "understand", "apply", "analyze"];

const RESOURCE_CATEGORIES = [
  "past_papers", // Sujets d'examens
  "textbook", // Manuels scolaires
  "exercise_book", // Livres d'exercices
  "summary", // Résumés de cours
  "video_lesson", // Cours vidéo
  "audio_lesson", // Cours audio
  "reference", // Documents de référence
  "worksheet", // Feuilles de travail
  "tutorial", // Tutoriels
  "cheat_sheet", // Fiches de révision
];

const EXAM_SESSIONS = ["may_june", "november", "january", "march"];

// Update MEDIA_TYPES
const MEDIA_TYPES = ["image", "audio", "video", "document"];

const SERIES = ["A", "C", "D", "ALL"]; // Series for BAC system

// =============== PAGINATION ===============

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// =============== VALIDATION RANGES ===============

const VALIDATION_RANGES = {
  SCORE: { MIN: 0, MAX: 100 },
  PASSWORD_MIN_LENGTH: 8,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  EXAM_YEAR: { MIN: 2024, MAX: 2030 },
};

// =============== EXPORTS ===============

module.exports = {
  // Core Africa-specific
  COUNTRIES,
  EXAM_TYPES,
  EDUCATION_LEVELS,
  GRADE_LEVELS,
  LANGUAGES,

  // Content
  SUBJECT_CATEGORIES,
  DIFFICULTY_LEVELS,
  QUESTION_TYPES,
  QUIZ_FORMATS,

  // User & Progress
  USER_ROLES,
  GENDERS,
  STATUSES,
  QUIZ_SESSION_STATUSES,

  // Notifications
  NOTIFICATION_TYPES,

  // Media
  MEDIA_TYPES,
  LEARNING_OBJECTIVES,
  RESOURCE_CATEGORIES,
  EXAM_SESSIONS,
  SERIES,

  // Utils
  PAGINATION,
    VALIDATION_RANGES,
};
